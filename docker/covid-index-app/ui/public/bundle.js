(function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    /* node_modules/fa-svelte/src/Icon.svelte generated by Svelte v3.20.1 */

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-p8vizn-style";
    	style.textContent = ".fa-svelte.svelte-p8vizn{width:1em;height:1em;overflow:visible;display:inline-block}";
    	append(document.head, style);
    }

    function create_fragment(ctx) {
    	let svg;
    	let path_1;
    	let svg_class_value;

    	return {
    		c() {
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			attr(path_1, "fill", "currentColor");
    			attr(path_1, "d", /*path*/ ctx[0]);
    			attr(svg, "aria-hidden", "true");
    			attr(svg, "class", svg_class_value = "" + (null_to_empty(/*classes*/ ctx[1]) + " svelte-p8vizn"));
    			attr(svg, "role", "img");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "viewBox", /*viewBox*/ ctx[2]);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path_1);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*path*/ 1) {
    				attr(path_1, "d", /*path*/ ctx[0]);
    			}

    			if (dirty & /*classes*/ 2 && svg_class_value !== (svg_class_value = "" + (null_to_empty(/*classes*/ ctx[1]) + " svelte-p8vizn"))) {
    				attr(svg, "class", svg_class_value);
    			}

    			if (dirty & /*viewBox*/ 4) {
    				attr(svg, "viewBox", /*viewBox*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { icon } = $$props;
    	let path = [];
    	let classes = "";
    	let viewBox = "";

    	$$self.$set = $$new_props => {
    		$$invalidate(4, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("icon" in $$new_props) $$invalidate(3, icon = $$new_props.icon);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 8) {
    			 $$invalidate(2, viewBox = "0 0 " + icon.icon[0] + " " + icon.icon[1]);
    		}

    		 $$invalidate(1, classes = "fa-svelte " + ($$props.class ? $$props.class : ""));

    		if ($$self.$$.dirty & /*icon*/ 8) {
    			 $$invalidate(0, path = icon.icon[4]);
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [path, classes, viewBox, icon];
    }

    class Icon extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-p8vizn-style")) add_css();
    		init(this, options, instance, create_fragment, safe_not_equal, { icon: 3 });
    	}
    }

    function fetchSearch(searchText, pfSource, cord19Source) {
      return     fetchSearchRemote(searchText, pfSource, cord19Source);
    }

    async function getFacets() {
      return   fetch("api/facets", { method: "GET" }).then(response => {
        return response.json().then(resultsData => {
          return Promise.resolve(resultsData);
        });
      });
    }

    function fetchSearchRemote(searchText, pfSource, cord19Source) {
      const sources = [];
      if (pfSource) {
        sources.push("pf");
      }
      if (cord19Source) {
        sources.push("cord-19");
      }
      const request = {
        "query": searchText,
        "sources": sources
      };
      return fetch("api/contentQuery", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      }).then(response => {
        return response.json().then(resultsData => {
          return Promise.resolve(resultsData);
        });
      });
    }

    function filterRecord(record, filters) {
      const keys = Object.getOwnPropertyNames(filters);
      let ret = true;
      keys.forEach(k => {
        if (filters[k] && filters[k].length > 0) {
          let recordCheck = false;
          if (record[k]) {
            if (typeof record[k] === 'string' || record[k] instanceof String) {
              if (filters[k].includes(record[k])) {
                recordCheck = true;
              }
            } else {
              record[k].forEach(element => {
                if (filters[k].includes(element)) {
                  recordCheck = true;
                }
              });
            }
          }
          ret &= recordCheck;
        }
      });
      return ret;
    }

    /* src/ResourceDetail.svelte generated by Svelte v3.20.1 */

    function create_if_block(ctx) {
    	let div7;
    	let div0;
    	let a;

    	let t0_value = (!/*record*/ ctx[0].title || /*record*/ ctx[0].title === "" || /*record*/ ctx[0].title === "NaN"
    	? /*record*/ ctx[0].url
    	: /*record*/ ctx[0].title) + "";

    	let t0;
    	let a_href_value;
    	let t1;
    	let div1;
    	let span0;
    	let t3;
    	let t4_value = formatSource(/*record*/ ctx[0].source) + "";
    	let t4;
    	let t5;
    	let div2;
    	let span1;
    	let t7;
    	let t8_value = formatValue(/*record*/ ctx[0].date) + "";
    	let t8;
    	let t9;
    	let div3;
    	let span2;
    	let t11;
    	let t12_value = formatValue(/*record*/ ctx[0].owner) + "";
    	let t12;
    	let t13;
    	let div4;
    	let span3;
    	let t15;

    	let t16_value = (/*record*/ ctx[0].tags
    	? /*record*/ ctx[0].tags.filter(func).join(", ")
    	: "None") + "";

    	let t16;
    	let t17;
    	let div5;
    	let span4;
    	let t19;
    	let t20_value = formatValue(/*record*/ ctx[0].purpose) + "";
    	let t20;
    	let t21;
    	let div6;
    	let t22_value = formatValue(/*record*/ ctx[0].description) + "";
    	let t22;

    	return {
    		c() {
    			div7 = element("div");
    			div0 = element("div");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "Source:";
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = space();
    			div2 = element("div");
    			span1 = element("span");
    			span1.textContent = "Date:";
    			t7 = space();
    			t8 = text(t8_value);
    			t9 = space();
    			div3 = element("div");
    			span2 = element("span");
    			span2.textContent = "Owner:";
    			t11 = space();
    			t12 = text(t12_value);
    			t13 = space();
    			div4 = element("div");
    			span3 = element("span");
    			span3.textContent = "Tags:";
    			t15 = space();
    			t16 = text(t16_value);
    			t17 = space();
    			div5 = element("div");
    			span4 = element("span");
    			span4.textContent = "Purpose:";
    			t19 = space();
    			t20 = text(t20_value);
    			t21 = space();
    			div6 = element("div");
    			t22 = text(t22_value);
    			attr(a, "class", "border-b border-dotted");
    			attr(a, "href", a_href_value = /*record*/ ctx[0].url);
    			attr(div0, "class", "font-semibold");
    			attr(span0, "class", "font-semibold");
    			attr(div1, "class", "text-gray-600 text-sm");
    			attr(span1, "class", "font-semibold");
    			attr(div2, "class", "text-gray-600 text-sm");
    			attr(span2, "class", "font-semibold");
    			attr(div3, "class", "text-gray-600 text-sm");
    			attr(span3, "class", "font-semibold");
    			attr(div4, "class", "text-gray-600 text-sm");
    			attr(span4, "class", "font-semibold");
    			attr(div5, "class", "text-gray-600 text-sm");
    			attr(div6, "class", "mt-2");
    			attr(div7, "class", "w-full flex flex-col mt-4");
    		},
    		m(target, anchor) {
    			insert(target, div7, anchor);
    			append(div7, div0);
    			append(div0, a);
    			append(a, t0);
    			append(div7, t1);
    			append(div7, div1);
    			append(div1, span0);
    			append(div1, t3);
    			append(div1, t4);
    			append(div7, t5);
    			append(div7, div2);
    			append(div2, span1);
    			append(div2, t7);
    			append(div2, t8);
    			append(div7, t9);
    			append(div7, div3);
    			append(div3, span2);
    			append(div3, t11);
    			append(div3, t12);
    			append(div7, t13);
    			append(div7, div4);
    			append(div4, span3);
    			append(div4, t15);
    			append(div4, t16);
    			append(div7, t17);
    			append(div7, div5);
    			append(div5, span4);
    			append(div5, t19);
    			append(div5, t20);
    			append(div7, t21);
    			append(div7, div6);
    			append(div6, t22);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*record*/ 1 && t0_value !== (t0_value = (!/*record*/ ctx[0].title || /*record*/ ctx[0].title === "" || /*record*/ ctx[0].title === "NaN"
    			? /*record*/ ctx[0].url
    			: /*record*/ ctx[0].title) + "")) set_data(t0, t0_value);

    			if (dirty & /*record*/ 1 && a_href_value !== (a_href_value = /*record*/ ctx[0].url)) {
    				attr(a, "href", a_href_value);
    			}

    			if (dirty & /*record*/ 1 && t4_value !== (t4_value = formatSource(/*record*/ ctx[0].source) + "")) set_data(t4, t4_value);
    			if (dirty & /*record*/ 1 && t8_value !== (t8_value = formatValue(/*record*/ ctx[0].date) + "")) set_data(t8, t8_value);
    			if (dirty & /*record*/ 1 && t12_value !== (t12_value = formatValue(/*record*/ ctx[0].owner) + "")) set_data(t12, t12_value);

    			if (dirty & /*record*/ 1 && t16_value !== (t16_value = (/*record*/ ctx[0].tags
    			? /*record*/ ctx[0].tags.filter(func).join(", ")
    			: "None") + "")) set_data(t16, t16_value);

    			if (dirty & /*record*/ 1 && t20_value !== (t20_value = formatValue(/*record*/ ctx[0].purpose) + "")) set_data(t20, t20_value);
    			if (dirty & /*record*/ 1 && t22_value !== (t22_value = formatValue(/*record*/ ctx[0].description) + "")) set_data(t22, t22_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div7);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*visible*/ ctx[1] && create_if_block(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (/*visible*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function formatValue(s) {
    	let ret = s;

    	if (!s || s === "" || s === "NaN") {
    		ret = "Not available";
    	}

    	return ret;
    }

    function formatSource(s) {
    	if (s === "pf") {
    		return "Police Foundation curated resources";
    	}

    	return "CORD-19 Dataset resources";
    }

    const func = v => v !== "";

    function instance$1($$self, $$props, $$invalidate) {
    	let { record } = $$props;
    	let { filters } = $$props;
    	let visible;

    	function applyFilters(filters) {
    		return filterRecord(record, filters);
    	}

    	$$self.$set = $$props => {
    		if ("record" in $$props) $$invalidate(0, record = $$props.record);
    		if ("filters" in $$props) $$invalidate(2, filters = $$props.filters);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*filters*/ 4) {
    			 $$invalidate(1, visible = applyFilters(filters));
    		}
    	};

    	return [record, visible, filters];
    }

    class ResourceDetail extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { record: 0, filters: 2 });
    	}
    }

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var faSearch = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'search';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f002';
    var svgPathData = 'M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faSearch = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faSearch);
    var faSearch_1 = faSearch.definition;
    var faSearch_2 = faSearch.faSearch;
    var faSearch_3 = faSearch.prefix;
    var faSearch_4 = faSearch.iconName;
    var faSearch_5 = faSearch.width;
    var faSearch_6 = faSearch.height;
    var faSearch_7 = faSearch.ligatures;
    var faSearch_8 = faSearch.unicode;
    var faSearch_9 = faSearch.svgPathData;

    var faTimesCircle = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'times-circle';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f057';
    var svgPathData = 'M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faTimesCircle = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faTimesCircle);
    var faTimesCircle_1 = faTimesCircle.definition;
    var faTimesCircle_2 = faTimesCircle.faTimesCircle;
    var faTimesCircle_3 = faTimesCircle.prefix;
    var faTimesCircle_4 = faTimesCircle.iconName;
    var faTimesCircle_5 = faTimesCircle.width;
    var faTimesCircle_6 = faTimesCircle.height;
    var faTimesCircle_7 = faTimesCircle.ligatures;
    var faTimesCircle_8 = faTimesCircle.unicode;
    var faTimesCircle_9 = faTimesCircle.svgPathData;

    var faPhone = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'phone';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f095';
    var svgPathData = 'M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faPhone = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faPhone);
    var faPhone_1 = faPhone.definition;
    var faPhone_2 = faPhone.faPhone;
    var faPhone_3 = faPhone.prefix;
    var faPhone_4 = faPhone.iconName;
    var faPhone_5 = faPhone.width;
    var faPhone_6 = faPhone.height;
    var faPhone_7 = faPhone.ligatures;
    var faPhone_8 = faPhone.unicode;
    var faPhone_9 = faPhone.svgPathData;

    var faEnvelope = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'envelope';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f0e0';
    var svgPathData = 'M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faEnvelope = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    unwrapExports(faEnvelope);
    var faEnvelope_1 = faEnvelope.definition;
    var faEnvelope_2 = faEnvelope.faEnvelope;
    var faEnvelope_3 = faEnvelope.prefix;
    var faEnvelope_4 = faEnvelope.iconName;
    var faEnvelope_5 = faEnvelope.width;
    var faEnvelope_6 = faEnvelope.height;
    var faEnvelope_7 = faEnvelope.ligatures;
    var faEnvelope_8 = faEnvelope.unicode;
    var faEnvelope_9 = faEnvelope.svgPathData;

    /* src/App.svelte generated by Svelte v3.20.1 */

    const { document: document_1 } = globals;

    function add_css$1() {
    	var style = element("style");
    	style.id = "svelte-z70bto-style";
    	style.textContent = ".body-font.svelte-z70bto{font-family:\"Lato\",\"Helvetica Neue\",\"Arial\",\"Helvetica\",-apple-system,sans-serif;-webkit-font-smoothing:antialiased}.body-background.svelte-z70bto{background-image:linear-gradient(0deg, rgb(152,193,219) 7%, rgb(0, 90, 142) 100%)\n  }.app-height-query.svelte-z70bto{height:calc(100% - 400px)}.app-height-results.svelte-z70bto{height:calc(100% - 100px)}.app-height-about.svelte-z70bto{height:calc(100% - 80px)}.cofrs-color.svelte-z70bto{color:rgb(255, 196, 60)}.nav-border-color.svelte-z70bto{border-color:rgba(255,255,255,0.2)\n  }.ta-no-resize.svelte-z70bto{resize:none\n  }";
    	append(document_1.head, style);
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[49] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[52] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[55] = list[i];
    	return child_ctx;
    }

    // (253:2) {:else}
    function create_else_block(ctx) {
    	let div4;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div3;
    	let current;
    	let if_block0 = /*facets*/ ctx[16] && create_if_block_2(ctx);
    	let if_block1 = /*results*/ ctx[12] && create_if_block_1(ctx);

    	return {
    		c() {
    			div4 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div3 = element("div");
    			div3.innerHTML = `<a href="http://www.policefoundation.org/copyright-information/">© 2020 National Police Foundation</a>`;
    			attr(div0, "class", "h-full w-1/4 bg-blue-100 rounded-lg text-sm p-2 overflow-y-auto");
    			attr(div1, "class", "h-full w-full flex flex-col ml-4");
    			attr(div2, "class", "h-full w-full flex flex-row bg-gray-100 p-4");
    			attr(div3, "class", "text-black w-full text-center bg-gray-400 py-4");
    			attr(div4, "class", "app-height-results svelte-z70bto");
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div2);
    			append(div2, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append(div2, t0);
    			append(div2, div1);
    			if (if_block1) if_block1.m(div1, null);
    			append(div4, t1);
    			append(div4, div3);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*facets*/ ctx[16]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*results*/ ctx[12]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div4);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    }

    // (228:2) {#if !resultsMode}
    function create_if_block$1(ctx) {
    	let div11;
    	let div9;
    	let div8;
    	let div0;
    	let t1;
    	let div2;
    	let input0;
    	let t2;
    	let div1;
    	let t3;
    	let div7;
    	let div4;
    	let input1;
    	let t4;
    	let div3;
    	let t6;
    	let div6;
    	let input2;
    	let t7;
    	let div5;
    	let t10;
    	let div10;
    	let current;
    	let dispose;

    	const icon = new Icon({
    			props: {
    				icon: /*searchIcon*/ ctx[17],
    				class: "fill-current text-gray-500 text-2xl align-middle mt-4"
    			}
    		});

    	return {
    		c() {
    			div11 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			div0 = element("div");
    			div0.textContent = "COVID-19 First Responder Research & Practice Reference Search";
    			t1 = space();
    			div2 = element("div");
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			create_component(icon.$$.fragment);
    			t3 = space();
    			div7 = element("div");
    			div4 = element("div");
    			input1 = element("input");
    			t4 = space();
    			div3 = element("div");
    			div3.textContent = "Include resources curated by the National Police Foundation";
    			t6 = space();
    			div6 = element("div");
    			input2 = element("input");
    			t7 = space();
    			div5 = element("div");
    			div5.innerHTML = `Include resources from the <a href="https://cord19.vespa.ai/" class="border-b-2 border-dotted border-white">CORD-19 Dataset</a>`;
    			t10 = space();
    			div10 = element("div");
    			div10.innerHTML = `<a href="http://www.policefoundation.org/copyright-information/">© 2020 National Police Foundation</a>`;
    			attr(div0, "class", "w-full text-center text-white text-4xl flex justify-center pb-4");
    			attr(input0, "placeholder", "Search...");
    			attr(input0, "class", "w-full rounded-full h-12 p-8 text-xl outline-none");
    			attr(div1, "class", "absolute right-0 pr-6 h-full");
    			attr(div2, "class", "justify-center flex w-2/3 relative");
    			attr(input1, "class", "mr-2 leading-tight align-middle");
    			attr(input1, "type", "checkbox");
    			attr(div3, "class", "align-middle text-white");
    			attr(div4, "class", "flex flex-inline items-center mt-2 mb-1 mx-4");
    			attr(input2, "class", "mr-2 leading-tight align-middle");
    			attr(input2, "type", "checkbox");
    			attr(div5, "class", "align-middle text-white");
    			attr(div6, "class", "flex flex-inline items-center mt-1 mb-2 mx-4");
    			attr(div7, "class", "flex flex-col w-1/3 mt-8 border-2 border-gray-500 py-2");
    			attr(div8, "class", "mt-64 w-full flex flex-col items-center");
    			attr(div9, "class", "h-full w-full items-center");
    			attr(div10, "class", "text-white w-full text-center");
    			attr(div11, "class", "app-height-query svelte-z70bto");
    		},
    		m(target, anchor, remount) {
    			insert(target, div11, anchor);
    			append(div11, div9);
    			append(div9, div8);
    			append(div8, div0);
    			append(div8, t1);
    			append(div8, div2);
    			append(div2, input0);
    			set_input_value(input0, /*searchText*/ ctx[8]);
    			append(div2, t2);
    			append(div2, div1);
    			mount_component(icon, div1, null);
    			append(div8, t3);
    			append(div8, div7);
    			append(div7, div4);
    			append(div4, input1);
    			input1.checked = /*pfSource*/ ctx[9];
    			append(div4, t4);
    			append(div4, div3);
    			append(div7, t6);
    			append(div7, div6);
    			append(div6, input2);
    			input2.checked = /*cord19Source*/ ctx[10];
    			append(div6, t7);
    			append(div6, div5);
    			append(div11, t10);
    			append(div11, div10);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen(input0, "input", /*input0_input_handler*/ ctx[43]),
    				listen(input0, "keyup", /*searchKeyup*/ ctx[22]),
    				listen(div1, "click", /*search*/ ctx[21]),
    				listen(input1, "change", /*input1_change_handler*/ ctx[44]),
    				listen(input2, "change", /*input2_change_handler*/ ctx[45])
    			];
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*searchText*/ 256 && input0.value !== /*searchText*/ ctx[8]) {
    				set_input_value(input0, /*searchText*/ ctx[8]);
    			}

    			if (dirty[0] & /*pfSource*/ 512) {
    				input1.checked = /*pfSource*/ ctx[9];
    			}

    			if (dirty[0] & /*cord19Source*/ 1024) {
    				input2.checked = /*cord19Source*/ ctx[10];
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div11);
    			destroy_component(icon);
    			run_all(dispose);
    		}
    	};
    }

    // (257:8) {#if facets}
    function create_if_block_2(ctx) {
    	let div0;
    	let t1;
    	let ul0;
    	let t2;
    	let div1;
    	let t4;
    	let ul1;
    	let each_value_2 = /*facets*/ ctx[16]["purpose"];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*facets*/ ctx[16]["tags"];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	return {
    		c() {
    			div0 = element("div");
    			div0.textContent = "Purpose";
    			t1 = space();
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			div1.textContent = "Tags";
    			t4 = space();
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div0, "class", "font-semibold mb-2");
    			attr(div1, "class", "font-semibold my-2");
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);
    			insert(target, t1, anchor);
    			insert(target, ul0, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul0, null);
    			}

    			insert(target, t2, anchor);
    			insert(target, div1, anchor);
    			insert(target, t4, anchor);
    			insert(target, ul1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul1, null);
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*facets, results, filter*/ 268505088) {
    				each_value_2 = /*facets*/ ctx[16]["purpose"];
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty[0] & /*facets, results, filter*/ 268505088) {
    				each_value_1 = /*facets*/ ctx[16]["tags"];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div0);
    			if (detaching) detach(t1);
    			if (detaching) detach(ul0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach(t2);
    			if (detaching) detach(div1);
    			if (detaching) detach(t4);
    			if (detaching) detach(ul1);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (260:12) {#each facets['purpose'] as purpose}
    function create_each_block_2(ctx) {
    	let li;
    	let input;
    	let input_data_purpose_value;
    	let input_disabled_value;
    	let t_value = /*purpose*/ ctx[55].facet + "";
    	let t;
    	let li_class_value;
    	let dispose;

    	return {
    		c() {
    			li = element("li");
    			input = element("input");
    			t = text(t_value);
    			attr(input, "type", "checkbox");
    			attr(input, "class", "mr-1 purpose-checkbox");
    			attr(input, "data-purpose", input_data_purpose_value = /*purpose*/ ctx[55].facet);
    			input.checked = true;
    			input.disabled = input_disabled_value = !isSidebarItemInResults("purpose", /*purpose*/ ctx[55].facet, /*results*/ ctx[12]);

    			attr(li, "class", li_class_value = isSidebarItemInResults("purpose", /*purpose*/ ctx[55].facet, /*results*/ ctx[12])
    			? ""
    			: "italic text-gray-700");
    		},
    		m(target, anchor, remount) {
    			insert(target, li, anchor);
    			append(li, input);
    			append(li, t);
    			if (remount) dispose();
    			dispose = listen(input, "click", /*click_handler*/ ctx[46]);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*facets*/ 65536 && input_data_purpose_value !== (input_data_purpose_value = /*purpose*/ ctx[55].facet)) {
    				attr(input, "data-purpose", input_data_purpose_value);
    			}

    			if (dirty[0] & /*facets, results*/ 69632 && input_disabled_value !== (input_disabled_value = !isSidebarItemInResults("purpose", /*purpose*/ ctx[55].facet, /*results*/ ctx[12]))) {
    				input.disabled = input_disabled_value;
    			}

    			if (dirty[0] & /*facets*/ 65536 && t_value !== (t_value = /*purpose*/ ctx[55].facet + "")) set_data(t, t_value);

    			if (dirty[0] & /*facets, results*/ 69632 && li_class_value !== (li_class_value = isSidebarItemInResults("purpose", /*purpose*/ ctx[55].facet, /*results*/ ctx[12])
    			? ""
    			: "italic text-gray-700")) {
    				attr(li, "class", li_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			dispose();
    		}
    	};
    }

    // (267:12) {#each facets['tags'] as tag}
    function create_each_block_1(ctx) {
    	let li;
    	let input;
    	let input_data_tags_value;
    	let input_disabled_value;
    	let t_value = /*tag*/ ctx[52].facet + "";
    	let t;
    	let li_class_value;
    	let dispose;

    	return {
    		c() {
    			li = element("li");
    			input = element("input");
    			t = text(t_value);
    			attr(input, "type", "checkbox");
    			attr(input, "class", "mr-1 tags-checkbox");
    			attr(input, "data-tags", input_data_tags_value = /*tag*/ ctx[52].facet);
    			input.checked = true;
    			input.disabled = input_disabled_value = !isSidebarItemInResults("tags", /*tag*/ ctx[52].facet, /*results*/ ctx[12]);

    			attr(li, "class", li_class_value = isSidebarItemInResults("tags", /*tag*/ ctx[52].facet, /*results*/ ctx[12])
    			? ""
    			: "italic text-gray-700");
    		},
    		m(target, anchor, remount) {
    			insert(target, li, anchor);
    			append(li, input);
    			append(li, t);
    			if (remount) dispose();
    			dispose = listen(input, "click", /*click_handler_1*/ ctx[47]);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*facets*/ 65536 && input_data_tags_value !== (input_data_tags_value = /*tag*/ ctx[52].facet)) {
    				attr(input, "data-tags", input_data_tags_value);
    			}

    			if (dirty[0] & /*facets, results*/ 69632 && input_disabled_value !== (input_disabled_value = !isSidebarItemInResults("tags", /*tag*/ ctx[52].facet, /*results*/ ctx[12]))) {
    				input.disabled = input_disabled_value;
    			}

    			if (dirty[0] & /*facets*/ 65536 && t_value !== (t_value = /*tag*/ ctx[52].facet + "")) set_data(t, t_value);

    			if (dirty[0] & /*facets, results*/ 69632 && li_class_value !== (li_class_value = isSidebarItemInResults("tags", /*tag*/ ctx[52].facet, /*results*/ ctx[12])
    			? ""
    			: "italic text-gray-700")) {
    				attr(li, "class", li_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			dispose();
    		}
    	};
    }

    // (275:8) {#if results}
    function create_if_block_1(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*results*/ ctx[12].length + "";
    	let t0;
    	let t1;
    	let span0;
    	let t2;
    	let t3;
    	let span1;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let div1;
    	let t9;
    	let div3;
    	let current;
    	let dispose;
    	let each_value = /*results*/ ctx[12];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = text(" matches for query ");
    			span0 = element("span");
    			t2 = text(/*searchText*/ ctx[8]);
    			t3 = space();
    			span1 = element("span");
    			t4 = text("(");
    			t5 = text(/*filteredRecordCount*/ ctx[14]);
    			t6 = text(" filtered)");
    			t7 = space();
    			div1 = element("div");
    			div1.textContent = "Return to Search";
    			t9 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(span0, "class", "italic ml-px");
    			attr(span1, "class", "ml-1");
    			attr(div1, "class", "border-b border-dashed border-gray-800 cursor-pointer");
    			attr(div2, "class", "p-2 w-full bg-gray-200 mb-2 font-semibold rounded flex justify-between");
    			attr(div3, "class", "h-full w-full overflow-y-auto");
    		},
    		m(target, anchor, remount) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			append(div0, t0);
    			append(div0, t1);
    			append(div0, span0);
    			append(span0, t2);
    			append(div0, t3);
    			append(div0, span1);
    			append(span1, t4);
    			append(span1, t5);
    			append(span1, t6);
    			append(div2, t7);
    			append(div2, div1);
    			insert(target, t9, anchor);
    			insert(target, div3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen(div1, "click", /*returnToSearch*/ ctx[29]);
    		},
    		p(ctx, dirty) {
    			if ((!current || dirty[0] & /*results*/ 4096) && t0_value !== (t0_value = /*results*/ ctx[12].length + "")) set_data(t0, t0_value);
    			if (!current || dirty[0] & /*searchText*/ 256) set_data(t2, /*searchText*/ ctx[8]);
    			if (!current || dirty[0] & /*filteredRecordCount*/ 16384) set_data(t5, /*filteredRecordCount*/ ctx[14]);

    			if (dirty[0] & /*results, filters*/ 12288) {
    				each_value = /*results*/ ctx[12];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div3, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			if (detaching) detach(t9);
    			if (detaching) detach(div3);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};
    }

    // (281:12) {#each results as record}
    function create_each_block(ctx) {
    	let current;

    	const resourcedetail = new ResourceDetail({
    			props: {
    				record: /*record*/ ctx[49],
    				filters: /*filters*/ ctx[13]
    			}
    		});

    	return {
    		c() {
    			create_component(resourcedetail.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(resourcedetail, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const resourcedetail_changes = {};
    			if (dirty[0] & /*results*/ 4096) resourcedetail_changes.record = /*record*/ ctx[49];
    			if (dirty[0] & /*filters*/ 8192) resourcedetail_changes.filters = /*filters*/ ctx[13];
    			resourcedetail.$set(resourcedetail_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(resourcedetail.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(resourcedetail.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(resourcedetail, detaching);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let div60;
    	let div6;
    	let div0;
    	let t3;
    	let div5;
    	let div1;
    	let t4;
    	let div1_class_value;
    	let t5;
    	let div2;
    	let t6;
    	let div2_class_value;
    	let t7;
    	let div3;
    	let t8;
    	let div3_class_value;
    	let t9;
    	let div4;
    	let t10;
    	let div4_class_value;
    	let t11;
    	let current_block_type_index;
    	let if_block;
    	let t12;
    	let div7;
    	let div7_class_value;
    	let t13;
    	let div18;
    	let div17;
    	let div10;
    	let div8;
    	let t15;
    	let div9;
    	let t16;
    	let div16;
    	let div15;
    	let div11;
    	let t20;
    	let div13;
    	let textarea;
    	let t21;
    	let div12;
    	let t22;
    	let div12_class_value;
    	let t23;
    	let div14;
    	let div18_class_value;
    	let t27;
    	let div27;
    	let div26;
    	let div21;
    	let div19;
    	let t29;
    	let div20;
    	let t30;
    	let div25;
    	let div22;
    	let t32;
    	let div23;
    	let a2;
    	let t34;
    	let div24;
    	let t35;
    	let div27_class_value;
    	let t36;
    	let div34;
    	let div33;
    	let div30;
    	let div28;
    	let t38;
    	let div29;
    	let t39;
    	let div32;
    	let div34_class_value;
    	let t43;
    	let div59;
    	let div58;
    	let div37;
    	let div35;
    	let t45;
    	let div36;
    	let t46;
    	let div57;
    	let div59_class_value;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*resultsMode*/ ctx[11]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const icon0 = new Icon({
    			props: {
    				icon: /*closeModalIcon*/ ctx[18],
    				class: "fill-current text-gray-800 text-2xl align-middle cursor-pointer"
    			}
    		});

    	const icon1 = new Icon({
    			props: {
    				icon: /*closeModalIcon*/ ctx[18],
    				class: "fill-current text-gray-800 text-2xl align-middle cursor-pointer"
    			}
    		});

    	const icon2 = new Icon({
    			props: {
    				icon: /*envelopeIcon*/ ctx[20],
    				class: "fill-current text-gray-800 align-middle mr-2"
    			}
    		});

    	const icon3 = new Icon({
    			props: {
    				icon: /*phoneIcon*/ ctx[19],
    				class: "fill-current text-gray-800 align-middle mr-2"
    			}
    		});

    	const icon4 = new Icon({
    			props: {
    				icon: /*closeModalIcon*/ ctx[18],
    				class: "fill-current text-gray-800 text-2xl align-middle cursor-pointer"
    			}
    		});

    	const icon5 = new Icon({
    			props: {
    				icon: /*closeModalIcon*/ ctx[18],
    				class: "fill-current text-gray-800 text-2xl align-middle cursor-pointer"
    			}
    		});

    	return {
    		c() {
    			div60 = element("div");
    			div6 = element("div");
    			div0 = element("div");
    			div0.innerHTML = `<span class="cofrs-color svelte-z70bto">COFRS-19</span>  <span class="text-white pl-1">Search</span>`;
    			t3 = space();
    			div5 = element("div");
    			div1 = element("div");
    			t4 = text("About");
    			t5 = space();
    			div2 = element("div");
    			t6 = text("Contact Us");
    			t7 = space();
    			div3 = element("div");
    			t8 = text("Add Your Resources");
    			t9 = space();
    			div4 = element("div");
    			t10 = text("Open Source");
    			t11 = space();
    			if_block.c();
    			t12 = space();
    			div7 = element("div");
    			t13 = space();
    			div18 = element("div");
    			div17 = element("div");
    			div10 = element("div");
    			div8 = element("div");
    			div8.textContent = "Add Your Resources";
    			t15 = space();
    			div9 = element("div");
    			create_component(icon0.$$.fragment);
    			t16 = space();
    			div16 = element("div");
    			div15 = element("div");
    			div11 = element("div");

    			div11.innerHTML = `
              We welcome contribution of additional resources into the index. If you have a single resource (website, online document, etc.)
              you can share it with us via an
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSdR0rqsWtha0D25mNM9dS_NnYFrzZBPkq4m8wK8K4icwAjyOQ/viewform" class="border-b border-dotted border-gray-800">online form (preferred)</a>
              or you can provide the address (from your browser&#39;s address bar), a title, and (optionally) your contact information so we can reach you with any questions:
          `;

    			t20 = space();
    			div13 = element("div");
    			textarea = element("textarea");
    			t21 = space();
    			div12 = element("div");
    			t22 = text("Submit");
    			t23 = space();
    			div14 = element("div");

    			div14.innerHTML = `
              Feel free to email lists of multiple documents/resources to <a href="mailto:info@policefoundation.org" class="border-b border-dotted border-gray-800">info@policefoundation.org</a>.
          `;

    			t27 = space();
    			div27 = element("div");
    			div26 = element("div");
    			div21 = element("div");
    			div19 = element("div");
    			div19.textContent = "Contact Us";
    			t29 = space();
    			div20 = element("div");
    			create_component(icon1.$$.fragment);
    			t30 = space();
    			div25 = element("div");
    			div22 = element("div");
    			div22.textContent = "National Police Foundation";
    			t32 = space();
    			div23 = element("div");
    			create_component(icon2.$$.fragment);
    			a2 = element("a");
    			a2.textContent = "info@policefoundation.org";
    			t34 = space();
    			div24 = element("div");
    			create_component(icon3.$$.fragment);
    			t35 = text("202-833-1460");
    			t36 = space();
    			div34 = element("div");
    			div33 = element("div");
    			div30 = element("div");
    			div28 = element("div");
    			div28.textContent = "Open Source Software";
    			t38 = space();
    			div29 = element("div");
    			create_component(icon4.$$.fragment);
    			t39 = space();
    			div32 = element("div");

    			div32.innerHTML = `<div class="mb-1">
          COFRS-19 is licensed to the public under the Apache Software License, version 2.0. We welcome technical contributions from the community
          via <a class="border-b border-dotted border-gray-800" href="https://github.com/PoliceFoundation/COFRS-19">GitHub</a>.
          </div>`;

    			t43 = space();
    			div59 = element("div");
    			div58 = element("div");
    			div37 = element("div");
    			div35 = element("div");
    			div35.textContent = "About this Site";
    			t45 = space();
    			div36 = element("div");
    			create_component(icon5.$$.fragment);
    			t46 = space();
    			div57 = element("div");

    			div57.innerHTML = `<div class=" mt-8 flex flex-col"><div class="font-semibold mb-1">Background</div> 
          <div class="mb-1">
          COFRS-19, the First Responder Research &amp; Practice Reference Search project was created to support the needs of the first responder community by
          building a search capability that allows a user to access content from any organization, site or reference materials without having to conduct
          searches across multiple sites. Additionally, COFRS-19 was inspired by the Allen Institute for AI’s CORD-19 dataset project and therefore
          incorporates the CORD-19 dataset to support the research needs of the first responder community and to further the community’s reliance on
          scientific evidence generally. COFRS-19 is a unique open source tool and dataset because its designed to serve the strategic, tactical and
          research needs of first responder agencies and because it can identify and return content from across a variety of first responder organization
          websites and data repositories, reducing the need for first responder organizations to have to conduct searches across multiple organizations
          and associations. Features include a powerful search tool with customizable search options and terms, capability to embed the search tool into
          third-party sites via an API.
          </div> 
          <div class="font-semibold mb-1 mt-1">CORD-19 Dataset Usage</div> 
          <div class="mb-1">
          This application serves data from <a href="https://zenodo.org/record/3727291#.XoqclZNKhTY">COVID-19 Open Research Dataset</a> (CORD-19). 2020. Version 2020-04-03.
          </div> 
          <div class="font-semibold mb-1 mt-1">Usage</div> 
          <div class="mb-1">
          First responder organizations can conduct basic and advance searches of content related to COVID-19 related practices and concerns and/or conduct
          searches of published research using the CORD-19 dataset. Usage of the site and tool should not be considered medical advice and users acknowledge
          that the search results do not represent all of the content available on a topic and do not constitute a recommendation or suggestion by anyone.
          </div> 
          <div class="font-semibold mb-1 mt-1">Support</div> 
          <div class="mb-1">Contact the National Police Foundation at <a href="info@policefoundation.org">info@policefoundation.org</a> for support.</div> 
          <div class="font-semibold mb-1 mt-1">Roadmap</div> 
          <div class="mb-1">The COFRS-19 roadmap includes a larger number of research results in response to a query, the availability of additional search tools
          capable of searching CORD-19 differently, and of course additional content.</div> 
          <div class="font-semibold mb-1 mt-1">Contributing</div> 
          <div class="mb-1">The success of COFRS-19 is dependent on the first responder community sharing content that can be searched and used by others. To share
          your content, contact the National Police Foundation at info@policefoundation.org.</div> 
          <div class="font-semibold mb-1 mt-1">Authors and Acknowledgement</div> 
          <div class="mb-1">The National Police Foundation acknowledges the important contribution of the CORD-19 dataset under license from the Allen Institute for AI,
          as well as the project development support and expertise of Scott Came and Cascadia Analytics. Additionally, the National Police Foundation recognizes the
          valuable content contributions via the public websites of the Centers for Disease Control and other U.S. government agencies as well as the International
          Association of Chiefs of Police, the Police Executive Research Forum and others.</div> 
          <div class="font-semibold mb-1 mt-1">License</div> 
          <div class="mb-1">Licensed under the Apache License, Version 2.0 (the &quot;License&quot;); you may not use this file except in compliance with the License.</div> 
          <div class="mb-1">You may obtain a copy of the License at <a href="http://www.apache.org/licenses/LICENSE-2.0">http://www.apache.org/licenses/LICENSE-2.0</a>.</div> 
          <div class="mb-1">Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an &quot;AS IS&quot; BASIS,
          WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and
          limitations under the License.</div></div>`;

    			attr(div0, "class", "ml-12 text-2xl font-bold");
    			attr(div1, "class", div1_class_value = "nav-border-color border-r cursor-pointer " + (/*aboutHover*/ ctx[2] ? "cofrs-color" : "") + " mr-2 pr-2" + " svelte-z70bto");
    			attr(div2, "class", div2_class_value = "nav-border-color border-r cursor-pointer " + (/*contactUsHover*/ ctx[0] ? "cofrs-color" : "") + " mr-2 pr-2" + " svelte-z70bto");
    			attr(div3, "class", div3_class_value = "nav-border-color border-r cursor-pointer " + (/*addResourcesHover*/ ctx[4] ? "cofrs-color" : "") + " mr-2 pr-2" + " svelte-z70bto");
    			attr(div4, "class", div4_class_value = "cursor-pointer " + (/*openSourceHover*/ ctx[6] ? "cofrs-color" : "") + " svelte-z70bto");
    			attr(div5, "class", "mr-12 text-lg text-white font-bold flex flex-row");
    			attr(div6, "class", "flex items-center justify-between h-20 border-b-4 nav-border-color svelte-z70bto");

    			attr(div7, "class", div7_class_value = "absolute top-0 left-0 h-full w-full bg-gray-500 opacity-75 items-center flex flex-col " + (/*contactUsModal*/ ctx[1] | /*aboutModal*/ ctx[3] | /*addResourcesModal*/ ctx[5] | /*openSourceModal*/ ctx[7]
    			? "visible"
    			: "invisible"));

    			attr(div8, "class", "text-xl font-semibold");
    			attr(div10, "class", "w-full flex items-center justify-between text-gray-800 border-b border-gray-800 pb-2");
    			attr(div11, "class", "mb-2");
    			attr(textarea, "class", "h-40 w-full mb-2 border border-gray-800 p-1 ta-no-resize svelte-z70bto");
    			attr(div12, "class", div12_class_value = "border border-gray-800 bg-gray-300 w-20 py-2 text-center rounded cursor-default select-none " + (/*feedbackContent*/ ctx[15] ? "hover:bg-gray-500" : ""));
    			attr(div13, "class", "mb-4 flex flex-col items-center justify-center");
    			attr(div14, "class", "mb-1");
    			attr(div15, "class", "mt-8 flex flex-col");
    			attr(div16, "class", "app-height-about svelte-z70bto");
    			attr(div17, "class", "mt-48 border-2 border-gray-600 w-1/2 h-100 p-4 align-middle bg-gray-100");
    			attr(div18, "class", div18_class_value = "absolute top-0 left-0 h-full w-full items-center flex flex-col " + (/*addResourcesModal*/ ctx[5] ? "visible" : "invisible"));
    			attr(div19, "class", "text-xl font-semibold");
    			attr(div21, "class", "w-full flex items-center justify-between text-gray-800 border-b border-gray-800 pb-2");
    			attr(div22, "class", "font-semibold mb-1");
    			attr(a2, "href", "mailto:info@policefoundation.org");
    			attr(a2, "class", "border-b border-dotted border-gray-800");
    			attr(div23, "class", "mb-px");
    			attr(div24, "class", "align-middle items-center");
    			attr(div25, "class", "mt-8 flex flex-col");
    			attr(div26, "class", "mt-48 border-2 border-gray-600 w-1/3 h-56 p-4 align-middle bg-gray-100");
    			attr(div27, "class", div27_class_value = "absolute top-0 left-0 h-full w-full items-center flex flex-col " + (/*contactUsModal*/ ctx[1] ? "visible" : "invisible"));
    			attr(div28, "class", "text-xl font-semibold");
    			attr(div30, "class", "w-full flex items-center justify-between text-gray-800 border-b border-gray-800 pb-2");
    			attr(div32, "class", "mt-8 flex flex-col");
    			attr(div33, "class", "mt-48 border-2 border-gray-600 w-1/3 h-56 p-4 align-middle bg-gray-100");
    			attr(div34, "class", div34_class_value = "absolute top-0 left-0 h-full w-full items-center flex flex-col " + (/*openSourceModal*/ ctx[7] ? "visible" : "invisible"));
    			attr(div35, "class", "text-xl font-semibold");
    			attr(div37, "class", "w-full flex items-center justify-between text-gray-800 border-b border-gray-800 pb-2");
    			attr(div57, "class", "app-height-about overflow-y-auto svelte-z70bto");
    			attr(div58, "class", "mt-48 border-2 border-gray-600 w-3/4 h-100 p-4 align-middle bg-gray-100");
    			attr(div59, "class", div59_class_value = "absolute top-0 left-0 h-full w-full items-center flex flex-col " + (/*aboutModal*/ ctx[3] ? "visible" : "invisible"));
    			attr(div60, "class", "h-full body-background pb-8 body-font relative svelte-z70bto");
    		},
    		m(target, anchor, remount) {
    			insert(target, div60, anchor);
    			append(div60, div6);
    			append(div6, div0);
    			append(div6, t3);
    			append(div6, div5);
    			append(div5, div1);
    			append(div1, t4);
    			append(div5, t5);
    			append(div5, div2);
    			append(div2, t6);
    			append(div5, t7);
    			append(div5, div3);
    			append(div3, t8);
    			append(div5, t9);
    			append(div5, div4);
    			append(div4, t10);
    			append(div60, t11);
    			if_blocks[current_block_type_index].m(div60, null);
    			append(div60, t12);
    			append(div60, div7);
    			append(div60, t13);
    			append(div60, div18);
    			append(div18, div17);
    			append(div17, div10);
    			append(div10, div8);
    			append(div10, t15);
    			append(div10, div9);
    			mount_component(icon0, div9, null);
    			append(div17, t16);
    			append(div17, div16);
    			append(div16, div15);
    			append(div15, div11);
    			append(div15, t20);
    			append(div15, div13);
    			append(div13, textarea);
    			set_input_value(textarea, /*feedbackContent*/ ctx[15]);
    			append(div13, t21);
    			append(div13, div12);
    			append(div12, t22);
    			append(div15, t23);
    			append(div15, div14);
    			append(div60, t27);
    			append(div60, div27);
    			append(div27, div26);
    			append(div26, div21);
    			append(div21, div19);
    			append(div21, t29);
    			append(div21, div20);
    			mount_component(icon1, div20, null);
    			append(div26, t30);
    			append(div26, div25);
    			append(div25, div22);
    			append(div25, t32);
    			append(div25, div23);
    			mount_component(icon2, div23, null);
    			append(div23, a2);
    			append(div25, t34);
    			append(div25, div24);
    			mount_component(icon3, div24, null);
    			append(div24, t35);
    			append(div60, t36);
    			append(div60, div34);
    			append(div34, div33);
    			append(div33, div30);
    			append(div30, div28);
    			append(div30, t38);
    			append(div30, div29);
    			mount_component(icon4, div29, null);
    			append(div33, t39);
    			append(div33, div32);
    			append(div60, t43);
    			append(div60, div59);
    			append(div59, div58);
    			append(div58, div37);
    			append(div37, div35);
    			append(div37, t45);
    			append(div37, div36);
    			mount_component(icon5, div36, null);
    			append(div58, t46);
    			append(div58, div57);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen(div1, "click", /*showAboutModal*/ ctx[24]),
    				listen(div1, "mouseover", /*mouseover_handler*/ ctx[35]),
    				listen(div1, "mouseout", /*mouseout_handler*/ ctx[36]),
    				listen(div2, "click", /*showContactUsModal*/ ctx[25]),
    				listen(div2, "mouseover", /*mouseover_handler_1*/ ctx[37]),
    				listen(div2, "mouseout", /*mouseout_handler_1*/ ctx[38]),
    				listen(div3, "click", /*showAddResourcesModal*/ ctx[26]),
    				listen(div3, "mouseover", /*mouseover_handler_2*/ ctx[39]),
    				listen(div3, "mouseout", /*mouseout_handler_2*/ ctx[40]),
    				listen(div4, "click", /*showOpenSourceModal*/ ctx[27]),
    				listen(div4, "mouseover", /*mouseover_handler_3*/ ctx[41]),
    				listen(div4, "mouseout", /*mouseout_handler_3*/ ctx[42]),
    				listen(div9, "click", /*hideModal*/ ctx[23]),
    				listen(textarea, "input", /*textarea_input_handler*/ ctx[48]),
    				listen(div12, "click", /*postFeedback*/ ctx[30]),
    				listen(div20, "click", /*hideModal*/ ctx[23]),
    				listen(div29, "click", /*hideModal*/ ctx[23]),
    				listen(div36, "click", /*hideModal*/ ctx[23])
    			];
    		},
    		p(ctx, dirty) {
    			if (!current || dirty[0] & /*aboutHover*/ 4 && div1_class_value !== (div1_class_value = "nav-border-color border-r cursor-pointer " + (/*aboutHover*/ ctx[2] ? "cofrs-color" : "") + " mr-2 pr-2" + " svelte-z70bto")) {
    				attr(div1, "class", div1_class_value);
    			}

    			if (!current || dirty[0] & /*contactUsHover*/ 1 && div2_class_value !== (div2_class_value = "nav-border-color border-r cursor-pointer " + (/*contactUsHover*/ ctx[0] ? "cofrs-color" : "") + " mr-2 pr-2" + " svelte-z70bto")) {
    				attr(div2, "class", div2_class_value);
    			}

    			if (!current || dirty[0] & /*addResourcesHover*/ 16 && div3_class_value !== (div3_class_value = "nav-border-color border-r cursor-pointer " + (/*addResourcesHover*/ ctx[4] ? "cofrs-color" : "") + " mr-2 pr-2" + " svelte-z70bto")) {
    				attr(div3, "class", div3_class_value);
    			}

    			if (!current || dirty[0] & /*openSourceHover*/ 64 && div4_class_value !== (div4_class_value = "cursor-pointer " + (/*openSourceHover*/ ctx[6] ? "cofrs-color" : "") + " svelte-z70bto")) {
    				attr(div4, "class", div4_class_value);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div60, t12);
    			}

    			if (!current || dirty[0] & /*contactUsModal, aboutModal, addResourcesModal, openSourceModal*/ 170 && div7_class_value !== (div7_class_value = "absolute top-0 left-0 h-full w-full bg-gray-500 opacity-75 items-center flex flex-col " + (/*contactUsModal*/ ctx[1] | /*aboutModal*/ ctx[3] | /*addResourcesModal*/ ctx[5] | /*openSourceModal*/ ctx[7]
    			? "visible"
    			: "invisible"))) {
    				attr(div7, "class", div7_class_value);
    			}

    			if (dirty[0] & /*feedbackContent*/ 32768) {
    				set_input_value(textarea, /*feedbackContent*/ ctx[15]);
    			}

    			if (!current || dirty[0] & /*feedbackContent*/ 32768 && div12_class_value !== (div12_class_value = "border border-gray-800 bg-gray-300 w-20 py-2 text-center rounded cursor-default select-none " + (/*feedbackContent*/ ctx[15] ? "hover:bg-gray-500" : ""))) {
    				attr(div12, "class", div12_class_value);
    			}

    			if (!current || dirty[0] & /*addResourcesModal*/ 32 && div18_class_value !== (div18_class_value = "absolute top-0 left-0 h-full w-full items-center flex flex-col " + (/*addResourcesModal*/ ctx[5] ? "visible" : "invisible"))) {
    				attr(div18, "class", div18_class_value);
    			}

    			if (!current || dirty[0] & /*contactUsModal*/ 2 && div27_class_value !== (div27_class_value = "absolute top-0 left-0 h-full w-full items-center flex flex-col " + (/*contactUsModal*/ ctx[1] ? "visible" : "invisible"))) {
    				attr(div27, "class", div27_class_value);
    			}

    			if (!current || dirty[0] & /*openSourceModal*/ 128 && div34_class_value !== (div34_class_value = "absolute top-0 left-0 h-full w-full items-center flex flex-col " + (/*openSourceModal*/ ctx[7] ? "visible" : "invisible"))) {
    				attr(div34, "class", div34_class_value);
    			}

    			if (!current || dirty[0] & /*aboutModal*/ 8 && div59_class_value !== (div59_class_value = "absolute top-0 left-0 h-full w-full items-center flex flex-col " + (/*aboutModal*/ ctx[3] ? "visible" : "invisible"))) {
    				attr(div59, "class", div59_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			transition_in(icon2.$$.fragment, local);
    			transition_in(icon3.$$.fragment, local);
    			transition_in(icon4.$$.fragment, local);
    			transition_in(icon5.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			transition_out(icon2.$$.fragment, local);
    			transition_out(icon3.$$.fragment, local);
    			transition_out(icon4.$$.fragment, local);
    			transition_out(icon5.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div60);
    			if_blocks[current_block_type_index].d();
    			destroy_component(icon0);
    			destroy_component(icon1);
    			destroy_component(icon2);
    			destroy_component(icon3);
    			destroy_component(icon4);
    			destroy_component(icon5);
    			run_all(dispose);
    		}
    	};
    }

    function isSidebarItemInResults(type, facet, results) {
    	let ret = false;

    	if (results) {
    		results.forEach(result => {
    			if (type === "purpose") {
    				ret |= result.purpose === facet;
    			} else if (type === "tags" && result.tags) {
    				ret |= result.tags.includes(facet);
    			}
    		});
    	}

    	return ret;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let searchIcon = faSearch_2;
    	let closeModalIcon = faTimesCircle_2;
    	let phoneIcon = faPhone_2;
    	let envelopeIcon = faEnvelope_2;

    	// nav bar state
    	let contactUsHover = false;

    	let contactUsModal = false;
    	let aboutHover = false;
    	let aboutModal = false;
    	let addResourcesHover = false;
    	let addResourcesModal = false;
    	let openSourceHover = false;
    	let openSourceModal = false;
    	let searchText, pfSource = true, cord19Source = true;
    	let resultsMode = false;
    	let results;
    	let filters = {};
    	let filteredRecordCount = 0;
    	let feedbackContent;
    	let facets;

    	function init() {
    		$$invalidate(11, resultsMode = false);
    		$$invalidate(12, results = null);
    		$$invalidate(13, filters = {});
    	}

    	window.onpopstate = event => {
    		if (event.state === "home") {
    			init();
    		}
    	};

    	let modalEscapeListener = e => {
    		if (e.key === "Escape") {
    			hideModal();
    		}
    	};

    	function search() {
    		if (searchText) {
    			$$invalidate(11, resultsMode = true);
    			history.pushState("home", "");

    			fetchSearch(searchText, pfSource, cord19Source).then((resolve, reject) => {
    				$$invalidate(12, results = resolve);
    				history.pushState(results, "");
    			});
    		}
    	}

    	onMount(() => {
    		$$invalidate(12, results = !history.state || history.state === "home" || history.state.status
    		? null
    		: history.state);

    		$$invalidate(11, resultsMode = results !== null);
    	});

    	function searchKeyup(e) {
    		if (e.key === "Enter") {
    			search();
    		}
    	}

    	function showModal() {
    		document.addEventListener("keyup", modalEscapeListener);
    	}

    	function hideModal() {
    		$$invalidate(3, aboutModal = false);
    		$$invalidate(1, contactUsModal = false);
    		$$invalidate(5, addResourcesModal = false);
    		$$invalidate(7, openSourceModal = false);
    		document.removeEventListener("keyup", modalEscapeListener);
    	}

    	function showAboutModal() {
    		$$invalidate(3, aboutModal = true);
    		showModal();
    	}

    	function showContactUsModal() {
    		$$invalidate(1, contactUsModal = true);
    		showModal();
    	}

    	function showAddResourcesModal() {
    		$$invalidate(5, addResourcesModal = true);
    		$$invalidate(15, feedbackContent = null);
    		showModal();
    	}

    	function showOpenSourceModal() {
    		$$invalidate(7, openSourceModal = true);
    		showModal();
    	}

    	function filter(sidebarItem) {
    		const newItems = [];

    		document.querySelectorAll("." + sidebarItem + "-checkbox").forEach(v => {
    			if (v.checked) {
    				newItems.push(v.dataset[sidebarItem]);
    			}
    		});

    		$$invalidate(13, filters[sidebarItem] = newItems, filters);
    		$$invalidate(13, filters);
    	}

    	function returnToSearch() {
    		init();
    		history.replaceState("home", "");
    	}

    	function getFilteredRecordCount(filters) {
    		let filtered = 0;

    		if (results && filters) {
    			results.forEach(record => {
    				if (filterRecord(record, filters)) {
    					filtered++;
    				}
    			});

    			filtered = results.length - filtered;
    		}

    		return filtered;
    	}

    	function postFeedback() {
    		if (feedbackContent) {
    			const request = { feedbackContent };

    			fetch("api/feedback", {
    				method: "PUT",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify(request)
    			}).then(() => {
    				hideModal();
    			});
    		}
    	}

    	getFacets().then((resolve, reject) => {
    		$$invalidate(16, facets = resolve);
    	});

    	const mouseover_handler = () => $$invalidate(2, aboutHover = true);
    	const mouseout_handler = () => $$invalidate(2, aboutHover = false);
    	const mouseover_handler_1 = () => $$invalidate(0, contactUsHover = true);
    	const mouseout_handler_1 = () => $$invalidate(0, contactUsHover = false);
    	const mouseover_handler_2 = () => $$invalidate(4, addResourcesHover = true);
    	const mouseout_handler_2 = () => $$invalidate(4, addResourcesHover = false);
    	const mouseover_handler_3 = () => $$invalidate(6, openSourceHover = true);
    	const mouseout_handler_3 = () => $$invalidate(6, openSourceHover = false);

    	function input0_input_handler() {
    		searchText = this.value;
    		$$invalidate(8, searchText);
    	}

    	function input1_change_handler() {
    		pfSource = this.checked;
    		$$invalidate(9, pfSource);
    	}

    	function input2_change_handler() {
    		cord19Source = this.checked;
    		$$invalidate(10, cord19Source);
    	}

    	const click_handler = () => filter("purpose");
    	const click_handler_1 = () => filter("tags");

    	function textarea_input_handler() {
    		feedbackContent = this.value;
    		$$invalidate(15, feedbackContent);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*filters*/ 8192) {
    			 $$invalidate(14, filteredRecordCount = getFilteredRecordCount(filters));
    		}
    	};

    	return [
    		contactUsHover,
    		contactUsModal,
    		aboutHover,
    		aboutModal,
    		addResourcesHover,
    		addResourcesModal,
    		openSourceHover,
    		openSourceModal,
    		searchText,
    		pfSource,
    		cord19Source,
    		resultsMode,
    		results,
    		filters,
    		filteredRecordCount,
    		feedbackContent,
    		facets,
    		searchIcon,
    		closeModalIcon,
    		phoneIcon,
    		envelopeIcon,
    		search,
    		searchKeyup,
    		hideModal,
    		showAboutModal,
    		showContactUsModal,
    		showAddResourcesModal,
    		showOpenSourceModal,
    		filter,
    		returnToSearch,
    		postFeedback,
    		init,
    		modalEscapeListener,
    		showModal,
    		getFilteredRecordCount,
    		mouseover_handler,
    		mouseout_handler,
    		mouseover_handler_1,
    		mouseout_handler_1,
    		mouseover_handler_2,
    		mouseout_handler_2,
    		mouseover_handler_3,
    		mouseout_handler_3,
    		input0_input_handler,
    		input1_change_handler,
    		input2_change_handler,
    		click_handler,
    		click_handler_1,
    		textarea_input_handler
    	];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document_1.getElementById("svelte-z70bto-style")) add_css$1();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {}, [-1, -1]);
    	}
    }

    new App({
    	target: document.body
    });

}());
//# sourceMappingURL=bundle.js.map
