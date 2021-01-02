<!--商家销量统计的横向树状图
-->
<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref">
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      chartInstance: null,
      allData: null,
      currentPage: 1,
      totalPage: 0,
      timerId: null
    }
  },
  mounted () {
    // dom结构加载完成
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'sellerData',
      chartName: 'seller',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    // 界面加载完成主动进行屏幕的适配
    this.screenAdapter()
  },
  created () {
    // 在组建创建完成之后，进行回调函数的调用
    this.$socket.registerCallBack('sellerData', this.getData)
  },
  destroyed () {
    clearTimeout(this.timerId)
    // 组件销毁的时候需要将监听器取消
    window.removeEventListener('resize', this.screenAdapter)
  },
  methods: {
    // 初始化echartInstance对象
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme) // 对图表对象进行鼠标事件的监听
      // 对图表初始化的控制 新旧option不是覆盖是相互整合的过程
      const initOption = {
        title: { // 标题及标题样式配置
          text: '✌ 商家销售统计',
          left: 20,
          top: 20
        },
        grid: { // echarts坐标轴大小配值
          top: '20%',
          left: '12%',
          right: '5%',
          bottom: '10%',
          containeLabel: true // 距离是包含坐标轴上的文字
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
        },
        tooltip: { // 背景以及提示
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              color: '#2D3443'
            }
          }
        },
        series: [
          {
            type: 'bar', // 柱状图
            label: { // 图表数值
              show: true,
              position: 'right',
              textStyle: {
                color: 'white'
              }
            },
            itemStyle: { // 柱状图每个条目的样式
              // 指明颜色的渐变方向 坐标(0, 0) 指向坐标(1, 0)
              // 指明不同的百分比之下颜色的值
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                {
                  offset: 0,
                  color: '#5052EE'
                },
                {
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('mouseover', () => {
        clearTimeout(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 获取服务器数据
    async getData () {
      // 向http://127.0.0.1:8888/api/seller 发起请求获取数据
      const { data: ret } = await this.$http.get('seller')
      // axios请求得到的数据是一个promise对象， 通过await可以解析这个promise对象
      this.allData = ret
      // 对数组排序
      this.allData.sort((a, b) => a.value - b.value)
      // 没五个元素显示一页
      this.totalPage = this.allData.length / 5 === 0 ? this.allData.length / 5 : this.allData.length / 5 + 1
      this.updateChart()
      // 启动定时器
      this.startInterval()
    },
    // 更新列表
    updateChart () {
      const start = (this.currentPage - 1) * 5
      const end = this.currentPage * 5
      const showData = this.allData.slice(start, end)
      const sellerNames = showData.map(item => item.name)
      const sellerValues = showData.map(item => item.value)
      // 柱状图
      const dataOption = {
        yAxis: {
          data: sellerNames
        },
        series: [
          {
            data: sellerValues
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    startInterval () {
      if (this.timerId) {
        clearTimeout(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.currentPage++
        if (this.currentPage >= this.totalPage) {
          this.currentPage = 1
        }
        this.updateChart()
      }, 3000)
    },
    // 浏览器窗口大小发生变化时会调用的方法，来完成屏幕的适配
    screenAdapter () {
      const titleFontsize = this.$refs.seller_ref.offsetWidth / 100 * 3.6
      // 和分辨率大小相关的项
      const adapterOption = {
        title: { // 标题及标题样式配置
          textStyle: {
            fontSize: titleFontsize
          }
        },
        tooltip: { // 背景以及提示
          axisPointer: {
            lineStyle: {
              width: titleFontsize
            }
          }
        },
        series: [
          {
            barWidth: titleFontsize, // 柱状图的宽度
            itemStyle: { // 柱状图每个条目的样式
              barBorderRadius: [0, titleFontsize / 2, titleFontsize / 2, 0] // 上右下左半径
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      // 需要手动调用图表对象的resize方法才能产生效果
      this.chartInstance.resize()
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
      this.updateChart()// 更新图表
    }
  }
}
</script>

<style>

</style>
