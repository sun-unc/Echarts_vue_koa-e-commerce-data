<!--
针对 sellerpage 这条路径显示出来的
在这个组件中，通过子组件注册方式，要显示出seller.vue这个子组件
-->
<template>
  <div class="com-page">
    <seller></seller>
  </div>
</template>

<script>
import Seller from '@/components/Seller'
export default {
  data () {
    return {

    }
  },
  methods: {

  },
  components: {
    Seller
  }
}
</script>

<style>

</style>
