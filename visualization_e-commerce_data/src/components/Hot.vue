<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
    <span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
    <span class="cat-name" :style="comStyle"> {{ catName }}</span>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'
export default {
  data () {
    return {
      chartInstance: null,
      allData: null, // 从服务器获取出来的数据
      mapData: {}, // 所获取的省份的地图的矢量数据
      currentIndex: 0,
      titleFontsize: 0
    }
  },
  computed: {
    ...mapState(['theme']),
    catName () {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.currentIndex].name
      }
    },
    comStyle () {
      return {
        fontSize: this.titleFontsize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    }
  },
  mounted () {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'hotData',
      chartName: 'hotproduct',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timerId)
  },
  created () {
    // 在组建创建完成之后，进行回调函数的调用
    this.$socket.registerCallBack('mapData', this.getData)
  },
  methods: {
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref, this.theme)
      const initOption = {
        title: {
          text: '✌ 热销商品占比',
          left: 20,
          top: 20
        },
        legend: {
          top: '15%',
          icon: 'circle'
        },
        tooltip: {
          show: true,
          formatter: arg => {
            let total = 0
            const thirdCategory = arg.data.children
            thirdCategory.forEach(item => {
              total += item.value
            })
            let retStr = ''
            thirdCategory.forEach(item => {
              retStr += `
                ${item.name}:${parseInt(item.value / total * 100) + '%'}
                <br />
              `
            })
            return retStr
          }
        },
        series: {
          type: 'pie',
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true
            }
          }
        }
      }
      this.chartInstance.setOption(initOption)
    },
    async getData () {
      const { data: ret } = await this.$http.get('hotproduct')
      this.allData = ret
      this.updateChar()
    },
    screenAdapter () {
      this.titleFontsize = this.$refs.hot_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontsize
          }
        },
        legend: {
          itemWidth: this.titleFontsize / 3,
          itemHeight: this.titleFontsize / 3,
          itemGap: this.titleFontsize / 3,
          textStyle: {
            fontSize: this.titleFontsize / 2
          }
        },
        series: [
          {
            radius: this.titleFontsize * 4.5,
            center: ['50%', '60%']
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    updateChar () {
      const legendData = this.allData[this.currentIndex].children.map(item => item.name)
      const seriesData = this.allData[this.currentIndex].children.map(item => {
        return {
          name: item.name,
          value: item.value,
          children: item.children
        }
      })
      const dataOption = {
        legend: {
          data: legendData
        },
        series: [
          {
            data: seriesData
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    toLeft () {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1
      }
      this.updateChar()
    },
    toRight () {
      this.currentIndex++
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0
      }
      this.updateChar()
    }
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
.arr-left {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.arr-right {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.cat-name {
  position: absolute;
  left: 80%;
  bottom: 20px;
  color: white;
}
</style>
