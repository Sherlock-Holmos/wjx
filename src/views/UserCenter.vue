<template>
  <div class="user-center">
    <!-- 顶部导航栏 -->
    <van-nav-bar safe-area-inset-top fixed>
      <template #left>
        <van-icon name="arrow-left" size="20" @click="$router.back()" color="#333" />
      </template>
      <template #title>
        <span class="nav-title">个人中心</span>
      </template>
    </van-nav-bar>

    <!-- 主要内容区 -->
    <div class="content-container">
      <!-- 用户信息区 -->
      <div class="user-info-card">
        <div class="avatar-container">
          <div class="avatar">{{ avatarText }}</div>
        </div>
        <div class="user-details">
          <div class="phone-number">{{ userName || phoneNumber }}</div>
          <div class="account-id">账号ID: {{ userId || '----' }}</div>
        </div>
      </div>

      <!-- 版本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <van-icon name="certificate" size="20" color="#1989fa" />
          <span class="card-title">当前版本</span>
        </div>
        <div class="card-content">
          <span class="version">{{ accountType }}</span>
          <van-button type="primary" size="small" class="upgrade-btn" @click="showUpgradeDialog">
            升级到标准版
          </van-button>
        </div>
      </div>

      <!-- 修改密码卡片 -->
      <div class="info-card">
        <div class="card-header">
          <van-icon name="lock" size="20" color="#1989fa" />
          <span class="card-title">修改密码</span>
        </div>
        <div class="card-content">
          <van-icon name="arrow" size="18" color="#969799" />
        </div>
      </div>

      <!-- 联系信息卡片 -->
      <div class="info-card">
        <div class="info-row">
          <div class="info-label">
            <van-icon name="phone" size="20" color="#1989fa" />
            <span>手机号码</span>
          </div>
          <div class="info-value">{{ phoneNumber || '----' }}</div>
        </div>

        <van-divider />

        <div class="info-row">
          <div class="info-label">
            <van-icon name="ai" size="20" color="#1989fa" />
            <span>AI点数</span>
          </div>
          <div class="info-value">30</div>
        </div>

        <van-divider />

        <div class="info-row">
          <div class="info-label">
            <van-icon name="eye" size="20" color="#1989fa" />
            <span>免广告次数</span>
          </div>
          <div class="info-value">0</div>
        </div>
      </div>

      <!-- 收款中心卡片 -->
      <div class="info-card payment-card">
        <div class="card-header">
          <van-icon name="cash-back-record" size="20" color="#1989fa" />
          <span class="card-title">收款中心</span>
          <div class="new-badge">新</div>
        </div>
        <div class="card-content">
          <span class="payment-type">商品题收款</span>
          <van-icon name="arrow" size="18" color="#969799" />
        </div>
      </div>

      <!-- 服务按钮区 -->
      <div class="service-buttons">
        <div class="service-button" @click="showAssistance">
          <van-icon name="friends" size="28" color="#1989fa" />
          <span>申请协助</span>
        </div>
        <div class="service-button" @click="openOnlineConsult">
          <van-icon name="chat" size="28" color="#1989fa" />
          <span>在线咨询</span>
        </div>
      </div>

      <!-- 页脚协议链接 -->
      <div class="footer-links">
        <span class="agreement-link" @click="openAgreement('user')">《用户服务协议》</span>
        <span class="agreement-link" @click="openAgreement('privacy')">《隐私条款》</span>
      </div>

      <!-- 未登录提示弹窗 -->
      <van-dialog v-model:show="showNotLoginDialog" title="提示" message="您尚未登录，请先登录" show-cancel-button>
        <template #confirm>
          <span @click="goToLogin">去登录</span>
        </template>
      </van-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog, Dialog } from 'vant';

const router = useRouter();

// 用户数据
const userData = ref(null);
const showNotLoginDialog = ref(false);

// 计算属性
const userName = computed(() => {
  return userData.value?.name || userData.value?.nickname || userData.value?.username;
});

const phoneNumber = computed(() => {
  return userData.value?.phone || userData.value?.phoneNumber || userData.value?.username;
});

const userId = computed(() => {
  return userData.value?.id || userData.value?.userId;
});

const accountType = computed(() => {
  if (!userData.value) return '未登录';

  switch (userData.value.accountType?.toUpperCase()) {
    case 'PERSONAL': return '免费版';
    case 'BUSINESS': return '企业试用版';
    case 'PREMIUM': return '标准版';
    default: return '免费版';
  }
});

const avatarText = computed(() => {
  if (!userData.value) return '未';

  // 如果服务器提供了名称，使用名称首字符
  if (userData.value.username) return userData.value.username.charAt(0);

  // 否则尝试从手机号/用户名提取首字符
  if (phoneNumber.value) return phoneNumber.value.charAt(0);

  return '未';
});

// 加载用户数据
const loadUserData = () => {
  const userJson = localStorage.getItem('user');
  try {
    if (userJson) {
      userData.value = JSON.parse(userJson);
      console.log('用户数据加载成功:', userData.value);
    } else {
      console.log('未检测到用户登录信息');
      // 延迟显示弹窗，防止页面闪烁
      setTimeout(() => showNotLoginDialog.value = true, 500);
    }
  } catch (e) {
    console.error('解析用户数据失败:', e);
    showToast('用户信息异常，请重新登录');
    localStorage.removeItem('user');
    showNotLoginDialog.value = true;
  }
};

// 跳转登录页面
const goToLogin = () => {
  router.push('/login');
};

const showUpgradeDialog = () => {
  if (!userData.value) {
    showNotLoginDialog.value = true;
    return;
  }

  showDialog({
    title: '升级会员',
    message: `您确定要将 [${phoneNumber.value}] 升级到标准版会员吗？`,
    confirmButtonText: '立即升级',
  }).then(() => {
    showToast('正在升级到标准版...');
  });
};

const showAssistance = () => {
  if (!userData.value) {
    showNotLoginDialog.value = true;
    return;
  }
  showToast('申请协助功能已打开');
};

const openOnlineConsult = () => {
  if (!userData.value) {
    showNotLoginDialog.value = true;
    return;
  }
  showToast('在线咨询功能已打开');
};

const openAgreement = (type) => {
  const agreementTypes = {
    user: '用户服务协议',
    privacy: '隐私条款'
  };
  showToast(`打开${agreementTypes[type]}`);
};

// 页面加载时初始化用户数据
onMounted(() => {
  loadUserData();

  // 监听storage事件，实现多标签页同步
  window.addEventListener('storage', (event) => {
    if (event.key === 'user') {
      console.log('检测到用户数据变更，重新加载用户信息');
      loadUserData();
    }
  });
});
</script>

<style scoped>
/* 基础样式 - 确保全屏显示 */
.user-center {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 100;
}

/* 导航栏样式 - 固定在顶部 */
.van-nav-bar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 46px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 101;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* 内容容器 - 确保在导航栏下方 */
.content-container {
  flex: 1;
  padding: 20px 16px;
  padding-top: 20px;
  /* 为导航栏留出空间 */
  display: flex;
  flex-direction: column;
}

/* 用户信息卡片 */
.user-info-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background-color: #fff;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.avatar-container .avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: #e6f3ff;
  color: #1989fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  margin-right: 20px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.phone-number {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  margin-bottom: 8px;
}

.account-id {
  font-size: 15px;
  color: #555;
}

/* 信息卡片通用样式 */
.info-card {
  background-color: #fff;
  border-radius: 16px;
  margin-bottom: 16px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 17px;
  font-weight: 500;
  color: #222;
  margin-left: 10px;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version {
  font-size: 17px;
  font-weight: 500;
  color: #1989fa;
}

.upgrade-btn {
  border-radius: 20px;
  padding: 0 16px;
  height: 32px;
  font-size: 14px;
}

/* 信息行样式 */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
}

.info-label {
  display: flex;
  align-items: center;
  font-size: 17px;
  font-weight: 500;
  color: #222;
}

.info-label span {
  margin-left: 10px;
}

.info-value {
  font-size: 17px;
  font-weight: 500;
  color: #222;
}

/* 分隔线样式 */
.van-divider {
  margin: 0 -20px;
  border-color: #f0f0f0;
}

/* 收款中心卡片 */
.payment-card {
  position: relative;
  border-left: 4px solid #1989fa;
}

.payment-type {
  font-size: 16px;
  color: #555;
}

.new-badge {
  position: absolute;
  top: 20px;
  right: 100px;
  background-color: #ff4d4f;
  color: white;
  border-radius: 10px;
  font-size: 12px;
  padding: 2px 8px;
  font-weight: 500;
}

/* 服务按钮区 */
.service-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin: 24px 0;
}

.service-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 16px;
  padding: 28px 0;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.service-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.service-button span {
  font-size: 16px;
  font-weight: 500;
  color: #222;
  margin-top: 12px;
}

/* 页脚协议链接 */
.footer-links {
  text-align: center;
  margin-top: auto;
  padding: 20px 0 10px;
}

.agreement-link {
  font-size: 14px;
  font-weight: 500;
  color: #1989fa;
  margin: 0 10px;
  text-decoration: none;
  cursor: pointer;
}

.agreement-link:hover {
  text-decoration: underline;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .avatar-container .avatar {
    width: 64px;
    height: 64px;
    font-size: 28px;
  }

  .phone-number {
    font-size: 18px;
  }

  .info-label,
  .info-value,
  .card-title {
    font-size: 16px;
  }
}
</style>