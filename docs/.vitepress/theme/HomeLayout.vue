<script setup>
import DefaultTheme from "vitepress/theme";
const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #home-hero-image>
      <div class="hero-iframe-container">
        <iframe
          src="https://js.mtfm.io/j/5808e75401125427c90cada4daea9f9648e5f11fee7f07bf5cf852d7217b194e"
          class="hero-iframe"
          frameborder="0"
          allow="clipboard-read; clipboard-write"
        ></iframe>
        <p class="hero-tagline-line">
          URL: <a href="https://js.mtfm.io/j/5808e75401125427c90cada4daea9f9648e5f11fee7f07bf5cf852d7217b194e"><span class="highlight">https://js.mtfm.io/j/5808e75401125...</span></a>
        </p>
        <p class="hero-tagline-line">
          The URL shareable and editable <span class="highlight"><a href="/docs/guide/ai">(with AI)</a></span> 
        </p>
      </div>
    </template>
  </Layout>
</template>

<style>
.hero-iframe-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  padding-left: 32px;
}

.hero-iframe {
  width: 100%;
  height: 400px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
}

@media (min-width: 960px) {
  .hero-iframe {
    height: 500px;
  }
}

.hero-tagline-line {
  margin: 0;
  padding-top: 4px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.hero-tagline-line .highlight {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
</style>
