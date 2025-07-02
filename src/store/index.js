// store/index.js
import { createStore } from 'vuex'

// 创建 store 实例
const store = createStore({
  state: {
    // 定义状态（数据）
    phoneOrUsername: '',
  },
  mutations: {
    // 定义修改状态的方法（必须是同步函数）
    setphoneOrUsername(state, newMessage) {
      state.phoneOrUsername = newMessage
    },
  },
  actions: {
    // 定义动作（可以包含异步操作）
    updatephoneOrUsername({ commit }, newMessage) {
      commit('setphoneOrUsername', newMessage)
    },
  },
  getters: {
    // 定义计算属性
    fullphoneOrUsername(state) {
      return state.phoneOrUsername
    },
  },
})

export default store
