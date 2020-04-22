<script>

  import Icon from 'fa-svelte';
  import ResourceDetail from './ResourceDetail.svelte';
  import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
  import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
  import { faPhone } from '@fortawesome/free-solid-svg-icons/faPhone';
  import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope';

  import { fetchSearch, getFacets, filterRecord } from './query.js';

  import { onMount } from 'svelte';

  let searchIcon = faSearch;
  let closeModalIcon = faTimesCircle;
  let phoneIcon = faPhone;
  let envelopeIcon = faEnvelope;

  // nav bar state
  let contactUsHover = false;
  let contactUsModal = false;
  let aboutHover = false;
  let aboutModal = false;
  let addResourcesHover = false;
  let addResourcesModal = false;
  let openSourceHover = false;
  let openSourceModal = false;

  let searchText, pfSource=true, cord19Source=true;
  let resultsMode = false;
  let results;
  let filters = {};
  let filteredRecordCount = 0;
  let feedbackContent;
  let facets;
  
  function init() {
    resultsMode = false;
    results = null;
    filters = {};
  }

  window.onpopstate = (event) => {
    if (event.state === "home") {
      init();
    }
  };

  let modalEscapeListener = (e) => {
    if (e.key==="Escape") {
      hideModal();
    }
  }

  function search() {
    if (searchText) {
      resultsMode = true;
      history.pushState("home", "");
      fetchSearch(searchText, pfSource, cord19Source).then((resolve, reject) => {
        results = resolve;
        history.pushState(results, "");
      });
    }
  }

  onMount(() => {
    results = !history.state || history.state === "home" || history.state.status ? null : history.state;
    resultsMode = results !== null;
  });

  function searchKeyup(e) {
    if (e.key==="Enter") {
      search();
    }
  }

  function showModal() {
    document.addEventListener('keyup', modalEscapeListener);
  }

  function hideModal() {
    aboutModal = false;
    contactUsModal = false;
    addResourcesModal = false;
    openSourceModal = false;
    document.removeEventListener('keyup', modalEscapeListener);
  }

  function showAboutModal() {
    aboutModal = true;
    showModal();
  }

  function showContactUsModal() {
    contactUsModal = true;
    showModal();
  }

  function showAddResourcesModal() {
    addResourcesModal = true;
    feedbackContent = null;
    showModal();
  }

  function showOpenSourceModal() {
    openSourceModal = true;
    showModal();
  }

  function filter(sidebarItem) {
    const newItems = [];
    document.querySelectorAll("." + sidebarItem + "-checkbox").forEach((v) => {
      if (v.checked) {
        newItems.push(v.dataset[sidebarItem]);
      }
    });
    filters[sidebarItem] = newItems;
    filters = filters;
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
      const request = {
        feedbackContent: feedbackContent
      };
      fetch("api/feedback", {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      }).then(() => {
        hideModal();
      });
    }
  }

  getFacets().then((resolve, reject) => {
    facets = resolve;
  });

  function isSidebarItemInResults(type, facet, results) {
    let ret = false;
    if (results) {
      results.forEach(result => {
        if (type==='purpose') {
          ret |= result.purpose === facet;
        } else if (type==='tags' && result.tags) {
          ret |= result.tags.includes(facet);
        }
      });
    }
    return ret;
  }

  $: filteredRecordCount = getFilteredRecordCount(filters);

</script>

<style>
  .body-font {
    font-family: "Lato","Helvetica Neue","Arial","Helvetica",-apple-system,sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .body-background {
    background-image: linear-gradient(0deg, rgb(152,193,219) 7%, rgb(0, 90, 142) 100%)
  }
  .app-height-query {
    height: calc(100% - 400px);
  }
  .app-height-results {
    height: calc(100% - 100px);
  }
  .app-height-about {
    height: calc(100% - 80px);
  }
  .cofrs-color {
    color: rgb(255, 196, 60);
  }
  .nav-border-color {
    border-color: rgba(255,255,255,0.2)
  }
  .ta-no-resize {
    resize: none
  }
</style>

<div class="h-full body-background pb-8 body-font relative">
  <div class="flex items-center justify-between h-20 border-b-4 nav-border-color">
    <div class="ml-12 text-2xl font-bold"><span class="cofrs-color">COFRS-19</span> <span class="text-white pl-1">Search</span></div>
    <div class="mr-12 text-lg text-white font-bold flex flex-row">
      <div class="nav-border-color border-r cursor-pointer {aboutHover ? 'cofrs-color' : ''} mr-2 pr-2"
        on:click="{showAboutModal}"
        on:mouseover="{() => aboutHover = true}"
        on:mouseout="{() => aboutHover = false}">About</div>
      <div class="nav-border-color border-r cursor-pointer {contactUsHover ? 'cofrs-color' : ''} mr-2 pr-2"
        on:click="{showContactUsModal}"
        on:mouseover="{() => contactUsHover = true}"
        on:mouseout="{() => contactUsHover = false}">Contact Us</div>
      <div class="nav-border-color border-r cursor-pointer {addResourcesHover ? 'cofrs-color' : ''} mr-2 pr-2"
        on:click="{showAddResourcesModal}"
        on:mouseover="{() => addResourcesHover = true}"
        on:mouseout="{() => addResourcesHover = false}">Add Your Resources</div>
      <div class="cursor-pointer {openSourceHover ? 'cofrs-color' : ''}"
        on:click="{showOpenSourceModal}"
        on:mouseover="{() => openSourceHover = true}"
        on:mouseout="{() => openSourceHover = false}">Open Source</div>
    </div>
  </div>
  {#if !resultsMode}
  <div class="app-height-query">
    <div class="h-full w-full items-center">
      <div class="mt-64 w-full flex flex-col items-center">
        <div class="w-full text-center text-white text-4xl flex justify-center pb-4">COVID-19 First Responder Research & Practice Reference Search</div>
        <div class="justify-center flex w-2/3 relative">
          <input placeholder="Search..." class="w-full rounded-full h-12 p-8 text-xl outline-none" bind:value="{searchText}" on:keyup="{searchKeyup}">
          <div class="absolute right-0 pr-6 h-full" on:click="{search}">
            <Icon icon={searchIcon} class="fill-current text-gray-500 text-2xl align-middle mt-4"></Icon>
          </div>
        </div>
        <div class="flex flex-col w-1/3 mt-8 border-2 border-gray-500 py-2">
          <div class="flex flex-inline items-center mt-2 mb-1 mx-4">
            <input class="mr-2 leading-tight align-middle" type="checkbox" bind:checked="{pfSource}">
            <div class="align-middle text-white">Include resources curated by the National Police Foundation</div>
          </div>
          <div class="flex flex-inline items-center mt-1 mb-2 mx-4">
            <input class="mr-2 leading-tight align-middle" type="checkbox" bind:checked="{cord19Source}">
            <div class="align-middle text-white">Include resources from the <a href="https://cord19.vespa.ai/" class="border-b-2 border-dotted border-white">CORD-19 Dataset</a></div>
          </div>
        </div>
      </div>
    </div>
    <div class="text-white w-full text-center"><a href="http://www.policefoundation.org/copyright-information/">© 2020 National Police Foundation</a></div>
  </div>
  {:else}
  <div class="app-height-results">
    <div class="h-full w-full flex flex-row bg-gray-100 p-4">
      <div class="h-full w-1/4 bg-blue-100 rounded-lg text-sm p-2 overflow-y-auto">
        {#if facets}
          <div class="font-semibold mb-2">Purpose</div>
          <ul>
            {#each facets['purpose'] as purpose}
            <li class="{isSidebarItemInResults('purpose', purpose.facet, results) ? '' : 'italic text-gray-700'}"><input type="checkbox" class="mr-1 purpose-checkbox"
              data-purpose={purpose.facet} on:click="{() => filter('purpose')}" checked disabled={!isSidebarItemInResults('purpose', purpose.facet, results)}>{purpose.facet}</li>
            {/each}
          </ul>
          <div class="font-semibold my-2">Tags</div>
          <ul>
            {#each facets['tags'] as tag}
            <li class="{isSidebarItemInResults('tags', tag.facet, results) ? '' : 'italic text-gray-700'}"><input type="checkbox" class="mr-1 tags-checkbox"
              data-tags={tag.facet} on:click="{() => filter('tags')}" checked disabled={!isSidebarItemInResults('tags', tag.facet, results)}>{tag.facet}</li>
            {/each}
          </ul>
        {/if}
      </div>
      <div class="h-full w-full flex flex-col ml-4">
        {#if results}
          <div class="p-2 w-full bg-gray-200 mb-2 font-semibold rounded flex justify-between">
            <div>{results.length} matches for query <span class="italic ml-px">{searchText}</span> <span class="ml-1">({filteredRecordCount} filtered)</span></div>
            <div class="border-b border-dashed border-gray-800 cursor-pointer" on:click="{returnToSearch}">Return to Search</div>
          </div>
          <div class="h-full w-full overflow-y-auto">
            {#each results as record}
              <ResourceDetail record={record} filters={filters}/>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    <div class="text-black w-full text-center bg-gray-400 py-4"><a href="http://www.policefoundation.org/copyright-information/">© 2020 National Police Foundation</a></div>
  </div>
  {/if}
  <div class="absolute top-0 left-0 h-full w-full bg-gray-500 opacity-75 items-center flex flex-col {contactUsModal|aboutModal|addResourcesModal|openSourceModal ? 'visible' : 'invisible'}"></div>
  <div class="absolute top-0 left-0 h-full w-full items-center flex flex-col {addResourcesModal ? 'visible' : 'invisible'}">
    <div class="mt-48 border-2 border-gray-600 w-1/2 h-100 p-4 align-middle bg-gray-100">
      <div class="w-full flex items-center justify-between text-gray-800 border-b border-gray-800 pb-2">
        <div class="text-xl font-semibold">Add Your Resources</div>
        <div on:click="{hideModal}"><Icon icon={closeModalIcon} class="fill-current text-gray-800 text-2xl align-middle cursor-pointer"></Icon></div>
      </div>
      <div class="app-height-about">
        <div class="mt-8 flex flex-col">
          <div class="mb-2">
              We welcome contribution of additional resources into the index. If you have a single resource (website, online document, etc.)
              you can share it with us via an
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSdR0rqsWtha0D25mNM9dS_NnYFrzZBPkq4m8wK8K4icwAjyOQ/viewform" class="border-b border-dotted border-gray-800">online form (preferred)</a>
              or you can provide the address (from your browser's address bar), a title, and (optionally) your contact information so we can reach you with any questions:
          </div>
          <div class="mb-4 flex flex-col items-center justify-center">
            <textarea class="h-40 w-full mb-2 border border-gray-800 p-1 ta-no-resize" bind:value={feedbackContent}></textarea>
            <div class="border border-gray-800 bg-gray-300 w-20 py-2 text-center rounded cursor-default select-none {feedbackContent ? 'hover:bg-gray-500' : ''}" on:click="{postFeedback}">Submit</div>
          </div>
          <div class="mb-1">
              Feel free to email lists of multiple documents/resources to <a href="mailto:info@policefoundation.org" class="border-b border-dotted border-gray-800">info@policefoundation.org</a>.
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="absolute top-0 left-0 h-full w-full items-center flex flex-col {contactUsModal ? 'visible' : 'invisible'}">
    <div class="mt-48 border-2 border-gray-600 w-1/3 h-56 p-4 align-middle bg-gray-100">
      <div class="w-full flex items-center justify-between text-gray-800 border-b border-gray-800 pb-2">
        <div class="text-xl font-semibold">Contact Us</div>
        <div on:click="{hideModal}"><Icon icon={closeModalIcon} class="fill-current text-gray-800 text-2xl align-middle cursor-pointer"></Icon></div>
      </div>
      <div class="mt-8 flex flex-col">
        <div class="font-semibold mb-1">National Police Foundation</div>
        <div class="mb-px"><Icon icon={envelopeIcon} class="fill-current text-gray-800 align-middle mr-2"></Icon><a href="mailto:info@policefoundation.org" class="border-b border-dotted border-gray-800">info@policefoundation.org</a></div>
        <div class="align-middle items-center"><Icon icon={phoneIcon} class="fill-current text-gray-800 align-middle mr-2"></Icon>202-833-1460</div>
      </div>
    </div>
  </div>
  <div class="absolute top-0 left-0 h-full w-full items-center flex flex-col {openSourceModal ? 'visible' : 'invisible'}">
    <div class="mt-48 border-2 border-gray-600 w-1/3 h-56 p-4 align-middle bg-gray-100">
      <div class="w-full flex items-center justify-between text-gray-800 border-b border-gray-800 pb-2">
        <div class="text-xl font-semibold">Open Source Software</div>
        <div on:click="{hideModal}"><Icon icon={closeModalIcon} class="fill-current text-gray-800 text-2xl align-middle cursor-pointer"></Icon></div>
      </div>
      <div class="mt-8 flex flex-col">
        <div class="mb-1">
          COFRS-19 is licensed to the public under the Apache Software License, version 2.0. We welcome technical contributions from the community
          via <a class="border-b border-dotted border-gray-800" href="https://github.com/PoliceFoundation/COFRS-19">GitHub</a>.
          </div>
      </div>
    </div>
  </div>
  <div class="absolute top-0 left-0 h-full w-full items-center flex flex-col {aboutModal ? 'visible' : 'invisible'}">
    <div class="mt-48 border-2 border-gray-600 w-3/4 h-100 p-4 align-middle bg-gray-100">
      <div class="w-full flex items-center justify-between text-gray-800 border-b border-gray-800 pb-2">
        <div class="text-xl font-semibold">About this Site</div>
        <div on:click="{hideModal}"><Icon icon={closeModalIcon} class="fill-current text-gray-800 text-2xl align-middle cursor-pointer"></Icon></div>
      </div>
      <div class="app-height-about overflow-y-auto">
        <div class=" mt-8 flex flex-col">
          <div class="font-semibold mb-1">Background</div>
          <div class="mb-1">
          COFRS-19, the First Responder Research & Practice Reference Search project was created to support the needs of the first responder community by
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
          <div class="mb-1">Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.</div>
          <div class="mb-1">You may obtain a copy of the License at <a href="http://www.apache.org/licenses/LICENSE-2.0">http://www.apache.org/licenses/LICENSE-2.0</a>.</div>
          <div class="mb-1">Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
          WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and
          limitations under the License.</div>
        </div>
      </div>
    </div>
  </div>
</div>

