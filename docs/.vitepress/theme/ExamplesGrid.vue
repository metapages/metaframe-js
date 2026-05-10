<script setup>
defineProps({
  examples: {
    type: Array,
    required: true,
  },
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
        <iframe
          :src="example.embedUrl"
          frameborder="0"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
      <div class="example-info">
        <h3>{{ example.title }}</h3>
        <p>{{ example.description }}</p>
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

@media (min-width: 960px) {
  .examples-grid {
    grid-template-columns: repeat(3, 1fr);
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

.example-thumbnail iframe {
  width: 200%;
  height: 200%;
  transform: scale(0.5);
  transform-origin: top left;
  pointer-events: none;
  border: none;
}

.example-info {
  padding: 12px 16px;
  border-top: 1px solid var(--vp-c-border);
}

.example-info h3 {
  margin: 0;
  font-size: 16px;
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
