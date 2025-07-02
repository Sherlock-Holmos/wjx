<template>
  <div class="auth-container">
    <!-- 顶部装饰背景 -->
    <div class="header-bg">
      <div class="earth"></div>
      <div class="cloud cloud1"></div>
      <div class="cloud cloud2"></div>
    </div>

    <!-- 登录/注册标签页 -->
    <div class="tabs-section">
      <div class="tab" :class="{ active: currentTab === 'login' }" @click="currentTab = 'login'">
        登录
      </div>
      <div class="tab" :class="{ active: currentTab === 'register' }" @click="currentTab = 'register'">
        注册
      </div>
    </div>

    <!-- 账号类型选择 - 仅在注册页显示 -->
    <div v-if="currentTab === 'register'" class="account-type">
      <div class="radio-option" :class="{ selected: accountType === 'personal' }" @click="accountType = 'personal'">
        <div class="radio-button"></div>
        <span>个人免费账号</span>
      </div>
      <div class="radio-option" :class="{ selected: accountType === 'business' }" @click="accountType = 'business'">
        <div class="radio-button"></div>
        <span>企业试用账号</span>
      </div>
    </div>

    <!-- 表单区域 -->
    <div class="form-container">
      <!-- 登录表单 -->
      <div v-if="currentTab === 'login'">
        <!-- 用户名/手机号/邮箱输入框 -->
        <div class="input-group">
          <label v-if="loginType === 'account'">手机号/邮箱/用户名</label>
          <label v-else-if="loginType === 'mobile'">手机号码</label>

          <input v-model="loginAccount" type="text" :placeholder="loginType === 'account' ? '手机号/邮箱/用户名' : '11位手机号码'"
            class="input-field" />
        </div>

        <!-- 密码输入框 -->
        <div v-if="loginType === 'account'" class="input-group">
          <div class="input-row">
            <label>密码</label>
            <span class="forgot-password" @click="handleForgotPassword">忘记密码?</span>
          </div>
          <input v-model="loginPassword" type="password" placeholder="密码" class="input-field" />
        </div>

        <!-- 短信验证码输入 - 仅短信登录时显示 -->
        <div v-if="loginType === 'mobile'" class="input-group">
          <label>验证码</label>
          <div class="sms-input">
            <input v-model="smsCode" type="text" placeholder="短信验证码" class="input-field" />
            <button class="get-code-btn" @click="getVerificationCode" :disabled="isCodeSending">
              {{ isCodeSending ? `已发送(${countdown}s)` : '获取验证码' }}
            </button>
          </div>
        </div>

        <!-- 登录按钮 -->
        <button class="primary-btn" @click="handleLogin" :disabled="isLoading">
          <span v-if="!isLoading">登录</span>
          <van-loading v-else size="20px" color="#ffffff" />
        </button>

        <!-- 切换登录方式 -->
        <div class="login-options">
          <div class="login-option" @click="loginType = 'account'">
            <van-icon name="user-o" size="1.5rem" />
            <span>账号密码登录</span>
          </div>
          <div class="login-option" @click="loginType = 'mobile'">
            <van-icon name="chat" size="1.5rem" />
            <span>短信验证码登录</span>
          </div>
        </div>
      </div>

      <!-- 注册表单 -->
      <div v-if="currentTab === 'register'">
        <!-- 手机号输入框 -->
        <div class="input-group">
          <label>11位手机号码</label>
          <input v-model="registerPhone" type="tel" placeholder="请输入手机号" class="input-field" />
        </div>

        <!-- 智能验证区域 -->
        <div class="verification-group">
          <button class="verification-btn" @click="startVerification">
            点击按钮开始智能验证
          </button>
        </div>

        <!-- 验证码输入框 -->
        <div class="input-group">
          <label>短信验证码</label>
          <div class="sms-input">
            <input v-model="registerSmsCode" type="text" placeholder="短信验证码" class="input-field" />
            <button class="get-code-btn" @click="getVerificationCode" :disabled="isCodeSending">
              {{ isCodeSending ? `已发送(${countdown}s)` : '获取验证码' }}
            </button>
          </div>
        </div>

        <!-- 密码输入框 -->
        <div class="input-group">
          <label>8-20位密码</label>
          <input v-model="registerPassword" type="password" placeholder="密码" class="input-field" />
        </div>

        <!-- 注册按钮 -->
        <button class="primary-btn" @click="handleRegister" :disabled="isLoading">
          <span v-if="!isLoading">注册</span>
          <van-loading v-else size="20px" color="#ffffff" />
        </button>

        <!-- 切换选项 -->
        <div class="switch-tab" @click="currentTab = 'login'">
          已有账号？立即登录
        </div>
      </div>
    </div>

    <!-- 协议条款 -->
    <div class="agreement">
      <div class="agreement-box" @click="agreed = !agreed">
        <div class="checkbox" :class="{ checked: agreed }">
          <van-icon v-if="agreed" name="success" size="0.8rem" color="#fff" />
        </div>
      </div>
      <div class="agreement-text">
        我已阅读并同意问卷星<u>《用户服务协议》</u>和<u>《隐私条款》</u>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showSuccessToast, showFailToast, Loading as VanLoading } from 'vant';
import axios from 'axios';

const router = useRouter();

// API基础地址
const API_BASE_URL = 'http://localhost:8080/api/auth';

// 状态管理
const currentTab = ref('login');
const loginType = ref('account');
const accountType = ref('personal');

// 表单数据
const loginAccount = ref('');
const loginPassword = ref('');
const smsCode = ref('');
const registerPhone = ref('');
const registerSmsCode = ref('');
const registerPassword = ref('');
const agreed = ref(true);

// 加载状态
const isLoading = ref(false);
const isCodeSending = ref(false);
const countdown = ref(60);

// 开始智能验证
const startVerification = () => {
  showToast('开始智能验证');
};

// 获取验证码（前端模拟）
const getVerificationCode = () => {
  if (currentTab.value === 'login') {
    if (!loginAccount.value || !/^1[3-9]\d{9}$/.test(loginAccount.value)) {
      showFailToast('请输入正确的手机号');
      return;
    }
  } else {
    if (!registerPhone.value || !/^1[3-9]\d{9}$/.test(registerPhone.value)) {
      showFailToast('请输入正确的手机号');
      return;
    }
  }

  // 开始倒计时
  isCodeSending.value = true;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value === 0) {
      clearInterval(timer);
      isCodeSending.value = false;
      countdown.value = 60;
    }
  }, 1000);

  showSuccessToast('验证码已发送');
};

// 登录处理（调用API）
const handleLogin = async () => {
  if (currentTab.value !== 'login') return;

  try {
    isLoading.value = true;

    let response;
    if (loginType.value === 'account') {
      // 账号密码登录
      if (!loginAccount.value || !loginPassword.value) {
        showFailToast('请输入账号和密码');
        return;
      }

      response = await axios.post(`${API_BASE_URL}/login/password`, {
        phoneOrUsername: loginAccount.value,
        password: loginPassword.value
      });
    } else {
      // 短信验证码登录
      if (!loginAccount.value || !/^1[3-9]\d{9}$/.test(loginAccount.value)) {
        showFailToast('请输入正确的手机号');
        return;
      }
      if (!smsCode.value) {
        showFailToast('请输入验证码');
        return;
      }

      response = await axios.post(`${API_BASE_URL}/login/sms`, {
        phone: loginAccount.value
      });
    }

    // 登录成功处理
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));

    showSuccessToast('登录成功');
    router.push({ name: 'MainPage' });

  } catch (error) {
    // 从错误响应中提取真实错误消息
    const errorMessage = error.response?.data || error.message || '登录失败，请重试';
    showFailToast(errorMessage);
  } finally {
    isLoading.value = false;
  }
};

// 注册处理（调用API）
const handleRegister = async () => {
  if (currentTab.value !== 'register') return;

  // 前端验证
  if (!registerPhone.value || !/^1[3-9]\d{9}$/.test(registerPhone.value)) {
    showFailToast('请输入正确的手机号');
    return;
  }

  if (!registerPassword.value || registerPassword.value.length < 8 || registerPassword.value.length > 20) {
    showFailToast('密码长度需在8-20位之间');
    return;
  }

  if (!registerSmsCode.value) {
    showFailToast('请输入验证码');
    return;
  }

  if (!agreed.value) {
    showFailToast('请先同意用户协议和隐私条款');
    return;
  }

  try {
    isLoading.value = true;

    const response = await axios.post(`${API_BASE_URL}/register`, {
      phone: registerPhone.value,
      password: registerPassword.value,
      accountType: accountType.value.toUpperCase()
    });

    // 注册成功处理
    const user = response.data;
    showSuccessToast('注册成功');

    // 自动填充手机号到登录页
    loginAccount.value = registerPhone.value;

    // 切换到登录页
    currentTab.value = 'login';

  } catch (error) {
    // 从错误响应中提取真实错误消息
    const errorMessage = error.response?.data || error.message || '注册失败，请重试';
    showFailToast(errorMessage);
  } finally {
    isLoading.value = false;
  }
};

// 忘记密码
const handleForgotPassword = () => {
  showToast('跳转至找回密码页面');
  // 实际项目中会跳转到找回密码页面
};
</script>

<style scoped>
.auth-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #F0F7FF;
  padding: 20px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  display: flex;
  flex-direction: column;
}

/* 顶部装饰背景 */
.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 30%;
  overflow: hidden;
}

.earth {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background:
    radial-gradient(circle at 30% 30%, #3b82f6 10%, transparent 11%),
    radial-gradient(circle at 70% 40%, #1e40af 10%, transparent 11%),
    radial-gradient(circle at 30% 70%, #60a5fa 10%, transparent 11%);
  border-radius: 50%;
  box-shadow:
    0 0 40px rgba(59, 130, 246, 0.4),
    inset 0 0 40px rgba(255, 255, 255, 0.6);
}

.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

.cloud1 {
  width: 150px;
  height: 60px;
  top: 10%;
  right: -30px;
  box-shadow:
    -60px 30px 0 -25px rgba(255, 255, 255, 0.8),
    25px 5px 0 -10px rgba(255, 255, 255, 0.8);
}

.cloud2 {
  width: 120px;
  height: 50px;
  top: 30%;
  left: -20px;
  box-shadow:
    -40px 20px 0 -20px rgba(255, 255, 255, 0.8),
    20px 5px 0 -8px rgba(255, 255, 255, 0.8);
}

/* 登录/注册标签页 */
.tabs-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  margin-bottom: 30px;
}

.tab {
  padding: 0 25px 12px;
  font-size: 20px;
  color: #666;
  position: relative;
  cursor: pointer;
  font-weight: 500;
}

.tab.active {
  color: #1E62FF;
  font-weight: bold;
}

.tab.active:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  width: 60%;
  height: 4px;
  background-color: #1E62FF;
  border-radius: 2px;
}

/* 账号类型选择 */
.account-type {
  display: flex;
  margin-bottom: 25px;
  justify-content: center;
  gap: 30px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #333;
  cursor: pointer;
}

.radio-option.selected {
  color: #1E62FF;
  font-weight: bold;
}

.radio-button {
  width: 18px;
  height: 18px;
  border: 1px solid #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-option.selected .radio-button {
  background-color: #1E62FF;
  border-color: #1E62FF;
}

.radio-option.selected .radio-button:after {
  content: '';
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 50%;
}

/* 表单容器 */
.form-container {
  position: relative;
  z-index: 2;
  flex: 1;
  padding: 0 15px;
}

/* 输入框组 */
.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.input-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password {
  font-size: 13px;
  color: #1E62FF;
  cursor: pointer;
}

.input-field {
  width: 100%;
  height: 48px;
  padding: 0 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 16px;
  background-color: white;
  box-sizing: border-box;
  color: #333 !important;
  /* 深灰色确保可读性 */
}

/* 聚焦状态保持深色 */
.input-field:focus {
  color: #222 !important;
  /* 更深的聚焦状态 */
  border-color: #1E62FF;
  /* 可添加聚焦边框 */
}

/* 设置placeholder颜色 */
.input-field::placeholder {
  color: #aaa !important;
  /* 浅灰色提示文字 */
}

/* 短信输入框组 */
.sms-input {
  display: flex;
  gap: 12px;
}

.sms-input .input-field {
  flex: 1;
}

.get-code-btn {
  min-width: 100px;
  height: 48px;
  border: 1px solid #1E62FF;
  border-radius: 10px;
  background-color: white;
  color: #1E62FF;
  font-size: 14px;
  padding: 0 12px;
}

.get-code-btn:disabled {
  border-color: #ccc;
  color: #999;
}

/* 验证按钮 */
.verification-group {
  margin: 25px 0;
}

.verification-btn {
  width: 100%;
  height: 48px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: white;
  font-size: 16px;
  color: #666;
}

/* 主按钮 */
.primary-btn {
  width: 100%;
  height: 50px;
  background-color: #1E62FF;
  border-radius: 10px;
  border: none;
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-top: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 登录选项 */
.login-options {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
}

.login-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 13px;
  color: #1E62FF;
  cursor: pointer;
}

.login-option span {
  margin-top: 6px;
}

/* 切换选项 */
.switch-tab {
  text-align: center;
  color: #1E62FF;
  font-size: 15px;
  margin-top: 20px;
  cursor: pointer;
}

/* 协议条款 */
.agreement {
  display: flex;
  margin-top: auto;
  margin-bottom: 25px;
  padding: 0 15px;
  align-items: flex-start;
}

.agreement-box {
  margin-right: 8px;
  cursor: pointer;
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}

.checkbox.checked {
  background-color: #1E62FF;
  border-color: #1E62FF;
}

.agreement-text {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  flex: 1;
}

.agreement-text u {
  color: #1E62FF;
}
</style>