module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      unitToConvert: 'px',  // 需要转换的单位
      viewportWidth: 375,    // 设计稿宽度（Vant基于375设计）
      unitPrecision: 6,      // 转换精度
      propList: ['*'],       // 转换所有属性
      viewportUnit: 'vw',    // 转换单位
      fontViewportUnit: 'vw',
      selectorBlackList: [], // 不转换的选择器
      minPixelValue: 1,      // 最小转换值
      mediaQuery: true,      // 允许媒体查询中转换
      replace: true,
      exclude: [/node_modules\/vant/] // 排除Vant库（重要！）
    }
  }
}