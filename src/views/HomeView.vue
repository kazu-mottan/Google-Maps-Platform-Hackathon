<template>
  <div class="home">
    <div class="title-container">
      <img src="../assets/quistroll.png" class="logo-img"/>
    </div>
    <el-icon class="lock-on" color="#8d8d8d"><FullScreen /></el-icon>
    <qrcode-stream style="height: 75vh; width: 100vw;" @decode="onDecode"></qrcode-stream>
  </div>
</template>

<script>
import  {  QrcodeStream }  from  "qrcode-reader-vue3";
import { FullScreen } from "@element-plus/icons-vue";
export default {
  name: 'HomeView',
  components: {
    QrcodeStream,
    FullScreen
  },
  methods: {
    onDecode (str) {
      this.$router.push({path: '/map', query: { id: str } });
    }
  }
}
</script>

<style scoped>
.home{
  width: 100vw;
  height: 100vh;
  background-color: #4285f4;
}
.title-container{
  height: 25vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.lock-on svg{
    position: absolute;
    top: 17vh;
    z-index: 1000;
    width: 80vw;
    height: 80vw;
}
.logo-img{
  height:80%; 
  background-color:white;
  box-shadow: rgba(0, 0, 0, 0.8) 0px 1px 4px -1px;
}
</style>
