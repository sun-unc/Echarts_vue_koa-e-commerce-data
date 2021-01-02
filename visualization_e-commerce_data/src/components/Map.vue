<template>
  <div class="com-container" @dblclick="revertMap">
    <div class="com-chart" ref="mapRef"></div>
  </div>
</template>
<script>
import { getProvinceMapInfo } from '@/utils/map_utils'
import { mapState } from 'vuex'
export default {
  data () {
    return {
      chartInstance: null,
      allData: null, // 从服务器获取出来的数据
      mapData: {} // 所获取的省份的地图的矢量数据
    }
  },
  mounted () {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  created () {
    // 在组建创建完成之后，进行回调函数的调用
    this.$socket.registerCallBack('mapData', this.getData)
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
  },
  methods: {
    async initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.mapRef, this.theme)
      const ret = await this.$http.get('map/china')
      console.log(ret)
      this.$echarts.registerMap('china', ret.data)
      const initOption = {
        title: {
          text: '✌ 商家分布',
          letf: 20,
          top: 20
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#0066CC',
            borderColor: '#333'
          }
        },
        legend: { // 图例
          left: '5%',
          bottom: '5%',
          orient: 'vertical'
        }
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('click', async arg => {
        const provinceInfo = getProvinceMapInfo(arg.name)
        // 需要获取这个省份的地图的矢量数据
        // 判断当前所点击这个的这个省份的地图矢量数据在mapDate中是否存在
        if (!this.mapData[provinceInfo.key]) {
          const res = await this.$http.get(provinceInfo.path)
          this.mapData[provinceInfo.key] = ret.data
          this.$echarts.registerMap(provinceInfo.key, res.data)
        }
        const changeOption = {
          geo: {
            map: provinceInfo.key
          }
        }
        this.chartInstance.setOption(changeOption)
      })
    },
    async getData () {
      const { data: ret } = await this.$http.get('map')
      this.allData = ret
      this.updateChar()
    },
    screenAdapter () {
      const titleFontsize = this.$refs.mapRef.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontsize
          }
        },
        legend: {
          itemWidth: titleFontsize / 3,
          itemHeight: titleFontsize / 3,
          itemGap: titleFontsize / 2, // 图例间隔
          textStyle: {
            fontSizeL: titleFontsize / 3
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    updateChar () {
      // 处理图表需要的数据
      // 图例的数据
      const legendArr = this.allData.map(item => item.name)
      const seriesArr = this.allData.map(item => {
        // return的这个对象就代表哦的是一个类别下的所有散点数据
        // 如果想在地图中显示散点的数据，所以我们需要给散点增加一个配值
        return {
          type: 'effectScatter',
          rippleEffect: { // 地图的波动点效果
            scale: 5,
            brushType: 'stroke'
          },
          name: item.name,
          data: item.children,
          coordinateSystem: 'geo' // 使用地图坐标系统
        }
      })
      const dataOption = {
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    revertMap () {
      // 回到中国地图
      const revertOption = {
        geo: {
          map: 'china'
        }
      }
      this.chartInstance.setOption(revertOption)
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    theme () {
      // console.log('主题切换了')
      // 销毁当前图表
      this.chartInstance.dispose()
      this.initChart()// 重新以最新的主题初始化图表对象
      this.screenAdapter()// 完成屏幕的适配
      this.updateChar()// 更新图表
    }
  }
}
</script>

<style lang='less' scoped>
</style>
