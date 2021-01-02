<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{'✌ ' + showTitle}}</span>
      <span class="iconfont title-icon"
      @click="showChoice = !showChoice"
      :style="comStyle">&#xe6eb;</span>
      <div class="select-con"
           v-show="showChoice"
           :style="marginStyle">
        <div class="select-item"
             v-for="item in selectType"
             :key="item.key"
             @click="handleSelect(item.key)">
          {{item.text}}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
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
      showChoice: false, // 是否显示可选项
      choiceType: 'map', // 显示的数据类型
      titleFontsize: 0 // 指明标题字体大小
    }
  },
  created () {
    // 在组建创建完成之后，进行回调函数的调用
    this.$socket.registerCallBack('trendData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    // 发送数据给服务器，告诉服务器，我现在需要数据
    this.$socket.send({
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    // 在组建销毁的时候进行组件回调函数的取消
    this.$socket.unregisterCallBack('trendData')
  },
  computed: {
    ...mapState(['theme']),
    selectType () {
      if (!this.allData) {
        return []
      } else {
        return this.allData.type.filter(item => item.key !== this.choiceType)
      }
    },
    showTitle () {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.choiceType].title
      }
    },
    // 设置标题样式
    comStyle () {
      return {
        fontSize: this.titleFontsize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
    marginStyle () {
      return {
        marginLeft: this.titleFontsize * 1.25 + 'px'
      }
    }
  },
  methods: {
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme)
      const initOption = {
        grid: {
          // 调整坐标轴
          left: '3%',
          top: '35%',
          right: '4%',
          bottom: '1%',
          containLabel: true
        },
        tooltip: {
          // 触发提示
          trigger: 'axis'
        },
        legend: {
          left: 20,
          top: '15%',
          icon: 'circle'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        }
      }
      this.chartInstance.setOption(initOption)
    },
    // ret就是服务器端发送给客户端的图表的数据
    getData (ret) {
      // 从服务器获取数据
      // const { data: ret } = await this.$http.get('trend')
      this.allData = ret
      this.updateChart()
    },
    updateChart () {
      // 半透明的颜色值
      const colorArr1 = [
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
      ]
      // 全透明的颜色
      const colorArr2 = [
        'rgba(11, 168, 44, 0)',
        'rgba(44, 110, 255, 0)',
        'rgba(22, 242, 217, 0)',
        'rgba(254, 33, 30, 0)',
        'rgba(250, 105, 0, 0)'
      ]
      // 处理数据
      // 类目轴的数据
      const timeArr = this.allData.common.month
      // y轴的数据 series 下的数据
      const valueArr = this.allData[this.choiceType].data
      const seriesArr = valueArr.map((item, index) => {
        return {
          name: item.name,
          type: 'line',
          data: item.data,
          stack: this.choiceType, // 形成堆叠效果
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colorArr1[index]
              }, // 0%的颜色值
              {
                offset: 1,
                color: colorArr2[index]
              } // 100%时的颜色值
            ])
          }
        }
      })
      // 图例的数据
      const legendArr = valueArr.map(item => item.name)
      const dataOption = {
        xAxis: {
          data: timeArr
        },
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter () {
      this.titleFontsize = this.$refs.trend_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontsize / 2,
          itemHeight: this.titleFontsize / 2,
          itemGap: this.titleFontsize / 2,
          textStyle: {
            fontSize: this.titleFontsize / 2
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    handleSelect (currentType) {
      this.choiceType = currentType
      this.updateChart()
      this.showChoice = false
    }
  },
  watch: {
    theme () {
      // console.log('主题切换了')
      // 销毁当前图表
      this.chartInstance.dispose()
      this.initChart()// 重新以最新的主题初始化图表对象
      this.screenAdapter()// 完成屏幕的适配
      this.updateChart()// 更新图表
    }
  }
}
</script>

<style lang='less' scoped>
  .title {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 20;
    color: white;
    cursor: pointer;
    .title-icon {
      margin-left: 10px;
    }
    .select-con {
      background-color: #222733;
    }
  }
</style>
