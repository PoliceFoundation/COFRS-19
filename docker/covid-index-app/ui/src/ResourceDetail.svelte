<script>

  import { filterRecord } from './query.js';

  export let record;
  export let filters;
  
  let visible;
  $: visible = applyFilters(filters);

  function applyFilters(filters) {
    return filterRecord(record, filters);
  }

  function formatValue(s) {
    let ret = s;
    if (!s || s==="" || s==="NaN") {
      ret = "Not available";
    }
    return ret;
  }

  function formatSource(s) {
    if (s === 'pf') {
      return "Police Foundation curated resources";
    }
    return "CORD-19 Dataset resources";
  }

</script>

{#if visible}
<div class="w-full flex flex-col mt-4">
  <div class="font-semibold"><a class="border-b border-dotted" href="{record.url}">{formatValue(record.title)}</a></div>
  <div class="text-gray-600 text-sm"><span class="font-semibold">Source:</span> {formatSource(record.source)}</div>
  <div class="text-gray-600 text-sm"><span class="font-semibold">Date:</span> {formatValue(record.date)}</div>
  <div class="text-gray-600 text-sm"><span class="font-semibold">Owner:</span> {formatValue(record.owner)}</div>
  <div class="text-gray-600 text-sm"><span class="font-semibold">Tags:</span> {record.tags ? record.tags.filter((v) => v !== '').join(", ") : "None"}</div>
  <div class="text-gray-600 text-sm"><span class="font-semibold">Purpose(s):</span> {record.purpose ? record.purpose.filter((v) => v !== '').join(", ") : "None"}</div>
  <div class="mt-2">{formatValue(record.description)}</div>
</div>
{/if}