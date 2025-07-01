<template>
  <div class="welcome-container">
    <!-- 品牌标识区 -->
    <div class="brand-section">
      <div class="brand-logo">
        <div class="wjx-brand">问卷星</div>
        <div class="wjx-domain">-WJX.CN-</div>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="content-section">
      <div class="slogan">
        <div class="slogan-line">不止</div>
        <div class="slogan-line">问卷调查</div>
        <div class="slogan-line">在线考试</div>
      </div>

      <div class="stats">
        <div class="stat">累计发布问卷3.22亿份</div>
        <div class="stat">回收答卷242.75亿份</div>
      </div>

      <div class="actions">
        <van-button type="primary" size="large" class="action-btn" @click="handleMainAction">
          免费使用
        </van-button>
        <van-button type="default" size="large" class="action-btn secondary" @click="handleAssistant">
          问卷星AI助手
        </van-button>
      </div>
    </div>

    <!-- 装饰元素区 -->
    <div class="decorations">
      <div class="telescope" @click="handleFunClick">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <circle cx="45" cy="55" r="5" fill="#fff" />
          <path d="M35,60 C25,70 20,75 20,75 L15,80 L10,75 L15,70 C15,70 25,65 35,55" fill="#fff" opacity="0.7"/>
          <path d="M55,55 C70,45 85,40 90,40 L95,35 L90,30 L85,35 C85,35 70,45 55,55" fill="#fff" opacity="0.7"/>
        </svg>
      </div>
      <van-icon name="chat" size="1.5rem" color="#fff" class="chat-bubble" @click="handleChat"/>
    </div>
  </div>
</template>

<script setup>
import { showToast } from 'vant'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleMainAction = () => {
  // 替换原来的跳转逻辑
  router.push({ name: 'RegisterPage' }) // 跳转到注册页面
  showToast('前往注册页面')
}

const handleAssistant = () => {
  // 跳转到AI助手页面
  showToast('打开问卷星AI助手')
}

const handleChat = () => {
  showToast('开始对话')
}

const handleFunClick = () => {
  showToast('🎉 准备好开始创建问卷了吗？')
}
</script>

<style scoped>
/* 整体容器 - 全屏欢迎页 */
.welcome-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #1E62FF 0%, #0032C7 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2rem;
  box-sizing: border-box;
  z-index: 100;
  overflow: hidden;
}

/* 品牌标识区 */
.brand-section {
  text-align: center;
  padding-top: 2rem;
}

.brand-logo {
  display: inline-block;
  margin-bottom: 1.5rem;
}

.wjx-brand {
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 3px;
}

.wjx-domain {
  font-size: 0.9rem;
  opacity: 0.85;
  letter-spacing: 1px;
  margin-top: 6px;
}

/* 内容区 */
.content-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3rem;
}

.slogan {
  text-align: center;
  margin-bottom: 2.5rem;
}

.slogan-line {
  font-size: 2.4rem;
  font-weight: 900;
  line-height: 1.4;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.stats {
  margin-bottom: 3rem;
  text-align: center;
}

.stat {
  font-size: 1rem;
  opacity: 0.9;
  margin: 10px 0;
  letter-spacing: 0.5px;
}

.actions {
  width: 100%;
  max-width: 300px;
}

.action-btn {
  margin: 15px 0;
  border-radius: 28px;
  font-weight: bold;
  letter-spacing: 0.5px;
  height: 50px;
  font-size: 1.1rem;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(4px);
}

/* 装饰元素区 */
.decorations {
  position: relative;
  height: 100px;
}

.telescope {
  position: absolute;
  left: 20px;
  bottom: 15px;
  opacity: 0.8;
  width: 100px;
  height: 100px;
  cursor: pointer;
}

.telescope svg {
  width: 100%;
  height: 100%;
}

.chat-bubble {
  position: absolute;
  right: 30px;
  bottom: 40px;
  background: rgba(255, 255, 255, 0.15);
  padding: 12px;
  border-radius: 50%;
  backdrop-filter: blur(4px);
  cursor: pointer;
}

/* 动画效果 */
.wjx-brand, .wjx-domain, .slogan-line, .stat, .action-btn {
  animation: fadeUpIn 0.8s ease-out forwards;
  opacity: 0;
}

@keyframes fadeUpIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slogan-line:nth-child(1) {
  animation-delay: 0.2s;
}
.slogan-line:nth-child(2) {
  animation-delay: 0.4s;
}
.slogan-line:nth-child(3) {
  animation-delay: 0.6s;
}
.stat:nth-child(1) {
  animation-delay: 0.8s;
}
.stat:nth-child(2) {
  animation-delay: 1.0s;
}
.action-btn:nth-child(1) {
  animation-delay: 1.2s;
}
.action-btn:nth-child(2) {
  animation-delay: 1.4s;
}
</style>