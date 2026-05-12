<script setup>
import {
  onMounted,
  ref,
} from 'vue';

const props = defineProps({
  examples: {
    type: Array,
    required: true,
  },
});

const ogData = ref({});

async function fetchOgData(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const getMetaContent = (property) => {
      const meta = doc.querySelector(`meta[property="${property}"]`);
      return meta ? meta.getAttribute('content') : null;
    };

    return {
      title: getMetaContent('og:title'),
      description: getMetaContent('og:description'),
      image: getMetaContent('og:image'),
    };
  } catch {
    return null;
  }
}

onMounted(async () => {
  const seen = new Set();
  const unique = props.examples.filter((e) => {
    if (seen.has(e.embedUrl)) return false;
    seen.add(e.embedUrl);
    return true;
  });

  const results = {};
  await Promise.all(
    unique.map(async (example) => {
      const data = await fetchOgData(example.embedUrl);
      if (data) {
        results[example.embedUrl] = data;
      }
    })
  );
  ogData.value = results;
});
</script>

<template>
  <div class="examples-grid">
    <a
      v-for="example in examples"
      :key="example.link"
      :href="example.link"
      class="example-card"
    >
      <div class="example-thumbnail">
        <img
          v-if="ogData[example.embedUrl]?.image"
          :src="ogData[example.embedUrl].image"
          :alt="ogData[example.embedUrl]?.title"
        />
        <div v-else class="thumbnail-placeholder" />
      </div>
      <div class="example-info">
        <h3>{{ ogData[example.embedUrl]?.title }}</h3>
        <p>{{ ogData[example.embedUrl]?.description }}</p>
      </div>
    </a>
  </div>
</template>

<style scoped>
.examples-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-top: 24px;
}

@media (min-width: 640px) {
  .examples-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.example-card {
  display: block;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.example-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.example-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.example-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
}

.example-info {
  padding: 12px 16px;
  border-top: 1px solid var(--vp-c-border);
}

.example-info h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.example-info p {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
</style>
