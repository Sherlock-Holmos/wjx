<template>
  <van-config-provider :theme-vars="themeVars">
    <router-view />
  </van-config-provider>
</template>

<script setup>
import { ref } from 'vue';

const active = ref(0);
</script>