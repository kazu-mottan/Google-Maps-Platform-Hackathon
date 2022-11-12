<template>
  <el-page-header @back="onback()" class="quiz-header">
    <template #content>
      <span class="quiz-title">Where is this place?</span>
    </template>
  </el-page-header>
  <el-card class="quiz-card">
    <el-container v-if="nowQuiz >= 1 && nowQuiz <= quizTotal">
      <el-aside width="100px">
        <el-image
          v-if="next.quizImage"
          class="quiz-image"
          style="width: 100%; height: 100%"
          :src="next.quizImage"
          :preview-src-list="[next.quizImage]"
          fit="cover"
        />
        <div v-else>
          <el-icon :size="30"><Picture /></el-icon>
          <div>No Image</div>
        </div>
      </el-aside>
      <el-main>
        <el-progress
          :percentage="100 * (nowQuiz / quizTotal)"
          :format="(p) => `${nowQuiz} of ${quizTotal}`"
        />
        <span v-if="next.quiz">{{ next.quiz }}</span>
        <span v-else>Please find the location from the image.</span>
      </el-main>
    </el-container>
    <el-container v-else>
      <el-aside width="100px">
        <div>
          <el-icon :size="30"><Picture /></el-icon>
          <div>No Image</div>
        </div>
      </el-aside>
      <el-main>
        <span v-if="nowQuiz === 0">First, please go to the start.</span>
        <span v-else>It' s almost there! Please go to the goal.</span>
      </el-main>
    </el-container>
  </el-card>
  <GoogleMap
    class="map-area"
    :api-key="apiKey"
    language="en"
    mapTypeId="roadmap"
    :center="center"
    :zoom="14"
    :clickableIcons="false"
    :fullscreenControl="false"
    :keyboardShortcuts="false"
    :mapTypeControl="false"
    :streetViewControl="false"
  >
    <CustomControl position="TOP_CENTER">
      <el-card class="icon-desc">
        <span
          ><img
            src="../assets/start-flag.svg"
            width="20"
            height="20"
            style="vertical-align: middle"
          />
          : Start</span
        >
        <span
          ><img
            src="../assets/goal-flag.svg"
            width="20"
            height="20"
            style="vertical-align: middle"
          />
          : Goal</span
        >
      </el-card>
    </CustomControl>
    <CustomControl position="TOP_LEFT">
      <button @click="aim()" class="custom-ctrl">
        <el-icon class="aim-btn"><Aim /></el-icon>
      </button>
    </CustomControl>
    <CustomControl position="BOTTOM_CENTER">
      <el-button
        type="primary"
        class="hand-btn"
        @click="showConfirm = true"
        style="width: calc(100vw - 200px)"
        :disabled="nowQuiz > quizTotal+1"
      >
        Submit Your Place
      </el-button>
    </CustomControl>
    <CustomControl position="TOP_RIGHT">
      <el-button
        circle
        color="#FFDE03"
        class="hand-btn"
        style="width: 50px"
        @click="showHint = true"
      >
        <el-icon :size="20" color="#4c4c4c"><Opportunity /></el-icon>
      </el-button>
    </CustomControl>
    <div v-for="(spot, index) in spots" :key="index">
      <Marker
        v-if="spot.type === 'midpoint'"
        :options="spotOption(spot)"
        @click="spotInfo(spot)"
      />
      <CustomMarker v-else :options="spotOption(spot)">
        <img
          v-if="spot.type === 'start'"
          src="../assets/start-flag.svg"
          width="40"
          height="40"
        />
        <img v-else src="../assets/goal-flag.svg" width="40" height="40" />
      </CustomMarker>
    </div>
    <Circle
      :options="{
        center: userPos,
        clickable: false,
        radius: gpsAccuracy,
        fillColor: '#78a9ff',
        fillOpacity: 0.3,
        strokeOpacity: 0,
      }"
    />
    <CustomMarker :options="{ position: userPos }">
      <img src="../assets/marker.svg" width="20" height="20" />
    </CustomMarker>
    <span v-if="wrongCount >= 3">
      <CustomMarker
        v-for="(ns, index) in next.hints.nearSpot"
        :key="index"
        :options="{ position: ns }"
      >
        <img src="../assets/hint-flag.svg" width="40" height="40" />
      </CustomMarker>
    </span>
   <Polyline v-for="(r, index) in route" :key="`route-${index}`"
      :options="{ path: r, geodesic: true, clickable: false, strokeColor: '#4285F4', strokeOpacity: 1.0,}" />
  </GoogleMap>
  <v-overlay v-model="showHint" class="hint-overlay">
    <h3 class="hint-title hint-font">1: Photos Uploaded by Google Map User</h3>
    <p class="hint-font hint-info">
      <el-icon><Warning /></el-icon> This hint will appear after one submition
      of the wrong place.
    </p>
    <el-carousel
      v-if="wrongCount >= 1"
      class="hint-image"
      arrow="always"
      :autoplay="false"
      height="20vh"
      style="width: 90vw"
    >
      <el-carousel-item
        v-for="(image, index) in next.hints.images"
        :key="index"
      >
        <el-image
          :src="`data:image/jpeg;charset=utf-8;base64,${image}`"
          fit="contain"
          style="width: 100%; height: 100%"
        />
      </el-carousel-item>
    </el-carousel>
    <h3 class="hint-title hint-font">2:Google Map User Review</h3>
    <p class="hint-font hint-info">
      <el-icon><Warning /></el-icon> This hint will appear after two submition
      of the wrong place.
    </p>
    <span v-if="wrongCount >= 2">
      <div
        v-for="(review, index) in next.hints.reviews"
        :key="index"
        style="width: 95%"
      >
        <el-divider v-if="index !== 0" />
        <p class="hint-font">{{ review }}</p>
      </div>
    </span>
    <h3 class="hint-title hint-font">3:Near Spot on Google Map</h3>
    <p class="hint-font hint-info">
      <el-icon><Warning /></el-icon> This hint will appear after three submition
      of the wrong place.
    </p>
    <p class="hint-font" v-if="wrongCount >= 3">
      Near spot is displayed as:
      <img
        src="../assets/hint-flag.svg"
        width="20"
        height="20"
        style="vertical-align: middle"
      />
    </p>
    <el-button size="large" class="hint-close" @click="showHint = false">
      <el-icon style="margin-right: 5px"><Close /></el-icon> Close Hints
    </el-button>
  </v-overlay>
  <v-overlay v-model="showSpotInfo" @click="showSpotInfo = false">
    <p style="height: 30vh">
      <el-image :src="`data:image/jpeg;charset=utf-8;base64,${showedSpot.image}`" fit="contain" class="spot-image" />
    </p>
    <h1 class="spot-desc">{{ showedSpot.name }}</h1>
    <p class="spot-desc">{{ showedSpot.description }}</p>
  </v-overlay>
  <el-dialog v-model="showConfirm" title="Submit Your Place" width="80vw">
    Have you arrived at the destination?
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showConfirm = false">Cancel</el-button>
        <el-button type="primary" @click="checkArrived()"> Arrived </el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    class="congrat"
    v-model="showCongrat"
    title="Congratulations!"
    width="80vw"
  >
    This is proof that you reached the goal. <br />
    It can be used as a coupon for local area.
    <vue-qrcode :value="qrBase64" :options="{ width: 200 }"></vue-qrcode>
  </el-dialog>
</template>

<script>
import { ElMessage } from "element-plus";
import {
  Opportunity,
  Aim,
  Picture,
  Close,
  Warning,
} from "@element-plus/icons-vue";
import {
  GoogleMap,
  CustomControl,
  Marker,
  CustomMarker,
  Circle,
  Polyline,
} from "vue3-google-map";
import { VOverlay } from "vuetify/components";
import { ref } from "vue";
import { getDistance } from "geolib";
import { useCookies, globalCookiesConfig } from "vue3-cookies";
import { useRoute } from "vue-router";
import { ElLoading } from "element-plus";

export default {
  name: "HomeView",
  components: {
    GoogleMap,
    CustomControl,
    Marker,
    CustomMarker,
    Circle,
    Polyline,
    Opportunity,
    Aim,
    Picture,
    Close,
    Warning,
    VOverlay,
  },
  data: () => ({
    showHint: false,
    showSpotInfo: false,
    showedSpot: null,
    showConfirm: false,
  }),
  methods: {
    aim() {
      this.center = this.userPos;
    },
    spotOption(spot) {
      const option = {};
      option.position = spot.position;
      if (spot.type !== "midpoint") {
        option.offsetX = 10;
        option.anchorPoint = "BOTTOM_CENTER";
      }
      return option;
    },
    spotInfo(spot) {
      this.showedSpot = spot;
      this.showSpotInfo = true;
    },
    checkArrived() {
      this.showConfirm = false;
      const arrived = this.checkPlace();
      this.arrivedMsg(arrived);
      setTimeout(async () => {
        const loading = ElLoading.service({
              lock: true,
              text: "Loading",
              background: "rgba(0, 0, 0, 0.7)",
        });
        await this.arrivedProcess(arrived);
        loading.close();
      }, 1000);
    },
    checkPlace() {
      const user = {
        latitude: this.userPos.lat,
        longitude: this.userPos.lng,
      };
      let target = {
        latitude: this.next.position.lat,
        longitude: this.next.position.lng,
      };
      if (this.nowQuiz === 0) {
        const start = this.spots.find((ele) => ele.type === "start");
        target = {
          latitude: start.position.lat,
          longitude: start.position.lng,
        };
      } else if (this.nowQuiz > this.quizTotal) {
        const goal = this.spots.find((ele) => ele.type === "goal");
        target = {
          latitude: goal.position.lat,
          longitude: goal.position.lng,
        };
      }
      const distance = getDistance(user, target);
      return distance <= 150 + this.gpsAccuracy;
    },
    arrivedMsg(arrived) {
      if (arrived) {
        ElMessage({
          message: "Arrived",
          type: "success",
        });
      } else {
        ElMessage.error("Not Arrived");
      }
    },
    async arrivedProcess(arrived) {
      if (arrived) {
        this.wrongCount = 0;
        // register next as spot
        if (this.nowQuiz >= 1 && this.nowQuiz <= this.quizTotal) {
          this.spots.push({
            type: "midpoint",
            position: this.next.position,
            name: this.next.name,
            image: this.next.image,
            description: this.next.description,
          });
        }
        // get next
        if(this.nowQuiz >= 1 && this.nowQuiz < this.quizTotal){
          await this.getNext(false);
        }
        // show congraturation window
        if(this.nowQuiz >= this.quizTotal + 1){
          this.showCongrat = true;
        }
        // add route
        if(this.nowQuiz >= 1 && this.nowQuiz <= this.quizTotal+1){
          const addRoute = this.routeRaw[this.nowQuiz - 1];
          this.route.push(addRoute);
        }
        this.nowQuiz++;
        this.cookieSync();
      } else if (this.nowQuiz >= 1 && this.nowQuiz <= this.quizTotal) {
        this.wrongCount++;
        this.cookieSync();
      }
    },
    cookieSync() {
      const mapID = this.$route.query.id;
      this.cookies.set(`${mapID}_now`, this.nowQuiz);
      this.cookies.set(`${mapID}_wrong`, this.wrongCount);
    },
    onback() {
      this.$router.push("/");
    },
  },
  computed: {
    qrBase64() {
      const mapID = this.$route.query.id;
      return window.btoa(JSON.stringify({ mapID: mapID, status: "goal" }));
    },
  },
  async setup() {
    const center = ref({ lat: 35.684129649804404, lng: 139.75510159163784 });
    const userPos = ref({ lat: 35.684129649804404, lng: 139.75510159163784 });
    const gpsAccuracy = ref(0.0);
    const setGPSValue = (pos) => {
      userPos.value = {
        lat: pos.latitude,
        lng: pos.longitude,
      };
      gpsAccuracy.value = pos.accuracy;
    };
    navigator.geolocation.watchPosition(
      (position) => {
        setGPSValue(position.coords);
      },
      (error) => {
        console.log(`GPS Error. Code: ${error.code}`);
      }
    );
    const apiKey = process.env.VUE_APP_GOOGLE_MAP_KEY;

    globalCookiesConfig({ expireTimes: "7d" });
    const { cookies } = useCookies();

    const router = useRoute();
    const mapID = router.query.id;

    const nowQuiz = ref(0);
    const wrongCount = ref(0);
    nowQuiz.value = cookies.isKey(`${mapID}_now`)
      ? cookies.get(`${mapID}_now`)
      : 0;
    wrongCount.value = cookies.isKey(`${mapID}_wrong`)
      ? cookies.get(`${mapID}_wrong`)
      : 0;

    const spots = ref([]);
    const next = ref({});
    const quizTotal = ref(0);
    const route = ref([]);

    let routeRaw = [];

    const getNext = async (fix) => {
      const index = (fix) ? nowQuiz.value - 1: nowQuiz.value;
      const data = await fetch(`/api/next/${mapID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ now: index }),
      }).then((response) => response.json());
      next.value = data.next;
    };

    await Promise.all([
      fetch(`/api/init/${mapID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ now: nowQuiz.value }),
      })
        .then((response) => response.json())
        .then((data) => {
          spots.value = data.spots;
          quizTotal.value = data.total;
          const start = data.spots.find((ele) => ele.type === "start");
          center.value = start.position;
        }),
      fetch(`/api/route/${mapID}`)
        .then((response) => response.json())
        .then((data) => {
          routeRaw = data.route;
          let end = nowQuiz.value - 1;
          if(end < 0){
            end = 0;
          }
          if(nowQuiz.value > routeRaw.length ){
            end = routeRaw.length;
          }
          route.value = routeRaw.slice(0,end);
        }),
      getNext(true),
    ]);

    const showCongrat = ref(false);
    showCongrat.value = nowQuiz.value > quizTotal.value+1;

    return {
      center,
      userPos,
      gpsAccuracy,
      apiKey,
      spots,
      next,
      quizTotal,
      route,
      cookies,
      nowQuiz,
      wrongCount,
      getNext,
      routeRaw,
      showCongrat
    };
  },
};
</script>

<style>
.quiz-header {
  height: 30px;
  padding: 10px;
  display: flex;
  box-shadow: rgba(0, 0, 0, 0.8) 0px 1px 4px -1px;
  background-color: #4285f4;
}
.quiz-title {
  font-size: 1.3rem;
  font-weight: bold;
}
.quiz-card {
  display: inline-block;
  height: 120px;
  width: 95%;
  box-shadow: var(--el-box-shadow-dark);
  margin: 10px 0;
}
.map-area {
  width: 100vw;
  height: calc(100vh - 202px);
}
.hand-btn {
  margin: 10px 10px 20px;
  height: 50px !important;
  box-shadow: var(--el-box-shadow-dark);
}
.aim-btn {
  margin: 10px;
  height: 20px;
  width: 20px;
  vertical-align: middle;
}
.custom-ctrl {
  box-sizing: border-box;
  background: white;
  height: 40px;
  width: 40px;
  border-radius: 2px;
  border: 0px;
  margin: 10px;
  padding: 0px;
  font-size: 1.25rem;
  text-transform: none;
  appearance: none;
  cursor: pointer;
  user-select: none;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
  overflow: hidden;
}
.quiz-card .el-card__body {
  padding: 5px !important;
  height: 100%;
}
.quiz-card .el-main {
  margin-left: 10px;
  padding: 0px !important;
  text-align: start;
  font-size: 0.8rem;
}
.quiz-card .el-container {
  height: 90% !important;
}
.quiz-card .el-aside {
  display: flex;
  justify-content: center;
  align-items: center;
}
.el-aside::-webkit-scrollbar {
  display: none;
}
.icon-desc {
  box-shadow: var(--el-box-shadow-dark);
  margin: 10px;
  height: 40px;
}
.icon-desc .el-card__body {
  padding: 10px;
}
.icon-desc span {
  margin: 5px;
  font-size: 0.8rem;
  vertical-align: top;
}
.v-overlay__scrim {
  opacity: 70% !important;
}
.spot-image {
  margin: 0 20px;
  height: 30vh;
  display: block !important;
}
.spot-desc {
  margin: 20px;
  color: #ffffff;
  font-weight: bolder;
}
.hint-font {
  color: #ffffff;
}
.hint-image {
  margin: 0 auto;
}
.hint-image .el-carousel__arrow {
  outline: #ffffff solid 1px !important;
}
.hint-overlay {
  padding: 20px;
}
.hint-overlay {
  pointer-events: auto !important;
  overflow: auto !important;
}
.hint-close {
  display: block !important;
  margin: 20px auto !important;
  width: 60%;
}
.hint-info {
  width: 95%;
  font-weight: lighter;
}
.congrat .el-dialog__title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #4285f4;
}
</style>