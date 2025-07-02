<template>
  <div class="main-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar class="nav-bar" safe-area-inset-top>
      <template #left>
        <van-icon name="wap-nav" size="24" class="menu-icon" @click="toggleMenu" />
      </template>

      <template #title>
        <van-search v-model="searchValue" shape="round" background="transparent" placeholder="搜索问卷" readonly
          @click="handleSearchClick" />
      </template>

      <template #right>
        <van-button size="small" type="primary" @click="handleCreateClick">
          创建
        </van-button>
      </template>
    </van-nav-bar>

    <!-- 下拉菜单 -->
    <transition name="slide-down">
      <div v-show="isMenuOpen" class="dropdown-menu">
        <div class="menu-item" @click="menuAction('user-center')">
          <van-icon name="manager" class="menu-icon" />
          <span>个人中心</span>
        </div>
        <div class="menu-item" @click="menuAction('share')">
          <van-icon name="friends" class="menu-icon" />
          <span>互填问卷</span>
        </div>
        <div class="menu-item" @click="menuAction('payment')">
          <van-icon name="cash-back-record" class="menu-icon" />
          <span>收款中心</span>
        </div>
        <div class="menu-item" @click="menuAction('service')">
          <van-icon name="service" class="menu-icon" />
          <span>在线客服</span>
        </div>
        <div class="menu-item" @click="menuAction('recycle')">
          <van-icon name="delete" class="menu-icon" />
          <span>回收站</span>
        </div>
        <div class="menu-item" @click="menuAction('analysis')">
          <van-icon name="chart-trending-o" class="menu-icon" />
          <span>分析</span>
        </div>
        <div class="menu-item" @click="menuAction('logout')">
          <van-icon name="close" class="menu-icon" />
          <span>退出</span>
        </div>
      </div>
    </transition>

    <!-- 菜单遮罩层 -->
    <van-overlay :show="isMenuOpen" @click="closeMenu" class="menu-overlay" />

    <!-- 主内容区 -->
    <div class="content-section">
      <!-- 用户信息展示（有问卷时显示） -->
      <template v-if="hasCreated">
        <div class="user-info-section">
          <div class="user-info-wrapper">
            <div class="greeting">你好 调查</div>
            <div class="status-tag">未发布</div>
          </div>

          <div class="response-count">
            <div class="count">0</div>
            <div class="label">答卷数量</div>
          </div>
        </div>

        <div class="questionnaire-management">
          <!-- 问卷列表占位符 -->
          <div class="empty-prompt">
            <van-image width="80" height="80" src="/src/assets/empty.png" />
            <p class="empty-text">暂无问卷数据</p>
          </div>
        </div>
      </template>

      <!-- 创建流程卡片（无问卷时显示） -->
      <div v-if="!hasCreated" class="creation-card">
        <!-- 步骤指示器 -->
        <div class="steps">
          <div class="step">
            <div class="step-circle">01</div>
            <div class="step-label">编辑问卷</div>
          </div>
          <div class="step">
            <div class="step-circle">02</div>
            <div class="step-label">发送问卷</div>
          </div>
          <div class="step">
            <div class="step-circle">03</div>
            <div class="step-label">统计分析</div>
          </div>
        </div>

        <!-- 标题区域 -->
        <div class="title-section">
          <div class="main-title">创建问卷，三步即可搞定</div>
          <div class="sub-title">支持调查、考试、投票、表单、360评估</div>
        </div>

        <!-- 创建按钮 -->
        <van-button type="primary" block class="create-btn" @click="handleCreateClick">
          创建新问卷
        </van-button>
      </div>

      <!-- 售前咨询链接 -->
      <div class="consultation-link">
        <van-icon name="service" class="consult-icon" />
        <span>售前咨询</span>
      </div>

      <!-- 底部提示 -->
      <div class="footer-tip">
        绑定问卷星微信，第一时间获取答卷提醒
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// import { getMyQuestionnaires } from '@/api/questionnaire'; // API调用

const router = useRouter();
const searchValue = ref('');
const isMenuOpen = ref(false);
const hasCreated = ref(false); // 标记用户是否创建过问卷

// onMounted(() => {
//   // 获取问卷数据
//   getMyQuestionnaires().then(response => {
//     // 根据返回结果判断用户是否创建过问卷
//     hasCreated.value = response.data && response.data.length > 0;
//   }).catch(error => {
//     console.error('获取问卷列表失败', error);
//   });
// });

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleSearchClick = () => {
  closeMenu();
  router.push('/search');
};

const handleCreateClick = () => {
  closeMenu();
  router.push({ name: 'SelectScenario' });

  // 创建新问卷后更新状态
  hasCreated.value = true;
};

const menuAction = (action) => {
  closeMenu();
  switch (action) {
    case 'user-center':
      router.push({ name: 'UserCenter' });
      break;
    case 'share':
      router.push({ name: 'Share' });
      break;
    case 'payment':
      router.push({ name: 'Payment' });
      break;
    case 'service':
      router.push({ name: 'Service' });
      break;
    case 'recycle':
      router.push({ name: 'Recycle' });
      break;
    case 'analysis':
      router.push({ name: 'Analysis' });
      break;
    case 'logout':
      // 退出时重置状态
      hasCreated.value = false;
      localStorage.removeItem('user');
      router.push({ name: 'RegisterPage' });
      console.log('退出登录');
      break;
    default:
      console.warn('未知操作:', action);
  }
};
</script>

<style scoped>
/* 整体容器 - 全屏页面 */
.main-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #333;
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow: auto;
}

/* 导航栏样式 */
.nav-bar {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 110;
}

.menu-icon {
  color: #1989fa;
  cursor: pointer;
}

/* 下拉菜单样式 */
.dropdown-menu {
  position: absolute;
  top: 46px;
  /* 导航栏高度 */
  left: 0;
  width: 100%;
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 120;
  padding: 8px 0;
  overflow: hidden;
}

.menu-item {
  padding: 14px 20px;
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #323233;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f7f8fa;
}

.menu-item span {
  margin-left: 12px;
}

.menu-item .menu-icon {
  font-size: 18px;
  color: #1989fa;
}

/* 下拉动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* 菜单遮罩层 */
.menu-overlay {
  z-index: 105;
  background-color: rgba(0, 0, 0, 0.5);
}

/* 主内容区 */
.content-section {
  flex: 1;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 100;
}

/* 用户信息区域 */
.user-info-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.user-info-wrapper {
  display: flex;
  align-items: center;
}

.greeting {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.status-tag {
  margin-left: 8px;
  background: #f0f7ff;
  color: #1989fa;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px;
}

.response-count {
  text-align: center;
}

.response-count .count {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.response-count .label {
  font-size: 12px;
  color: #969799;
}

/* 问卷管理区域 */
.questionnaire-management {
  background: #fff;
  border-radius: 12px;
  padding: 24px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 15px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-prompt {
  text-align: center;
}

.empty-text {
  font-size: 16px;
  color: #969799;
  margin-top: 12px;
}

/* 创建卡片 */
.creation-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  margin-top: 15px;
}

/* 步骤指示器 */
.steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #969799;
  margin-bottom: 8px;
  border: 1px solid #ebedf0;
  font-size: 16px;
}

.step-label {
  font-size: 14px;
  color: #646566;
  text-align: center;
  font-weight: 500;
}

/* 标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 24px;
}

.main-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}

.sub-title {
  font-size: 15px;
  color: #666;
  line-height: 1.5;
}

/* 按钮样式 */
.create-btn {
  border-radius: 30px;
  height: 48px;
  font-weight: 600;
  font-size: 16px;
}

/* 售前咨询 */
.consultation-link {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px 0;
  color: #1989fa;
  font-size: 15px;
  font-weight: 500;
}

.consult-icon {
  margin-right: 6px;
  font-size: 18px;
}

/* 底部提示 */
.footer-tip {
  text-align: center;
  font-size: 13px;
  color: #999;
  margin-top: auto;
  padding-bottom: 20px;
}
</style>