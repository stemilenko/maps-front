export default {
  build: {
    sourcemap: true
  },
  server: {
    watch: {
      usePolling: true
    },
    host: true, // Needed for the Docker Container port mapping to work
    port: 80
  }
}
