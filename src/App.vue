<template>
  <Suspense>
    <template #default>
      <router-view />
    </template>
    <template #fallback>
      <img src="./assets/loading.svg" style="width:60vw"/>
    </template>
    <template #error> Error </template>
  </Suspense>
</template>

<style>
body {
  margin: 0 !important;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
