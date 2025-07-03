<template>
  <div class="main-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar class="nav-bar" safe-area-inset-top fixed>
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
      <!-- 用户信息展示 -->
      <div v-if="hasSurveys" class="user-greeting">
        <div class="greeting">{{ greetingMessage }}</div>
      </div>

      <!-- 问卷列表 -->
      <div v-if="hasSurveys" class="survey-list">
        <div v-for="survey in surveys" :key="survey.id" class="survey-card">
          <div class="card-header">
            <div class="survey-title">{{ survey.title }}<div class="fill-hint" v-if="survey.status === 'PUBLISHED'">点击填写
              </div>
            </div>
            <div :class="statusClass(survey.status)">{{ surveyStatusText(survey.status) }}</div>
          </div>

          <div class="card-content">
            <div class="time-section">
              <div class="time">{{ formatTime(survey.createdAt) }}</div>
              <div class="date">{{ formatDate(survey.createdAt) }}</div>
            </div>

            <div class="info-section">
              <div class="question-count">{{ survey.questions.length }} 题</div>
              <div class="actions">
                <van-button v-if="survey.status === 'DRAFT'" class="action-button" size="small"
                  @click="publishSurvey(survey.id)">
                  发布
                </van-button>

                <!-- 草稿状态下的操作按钮 -->
                <template v-if="survey.status === 'DRAFT'">
                  <van-button plain class="action-button outline" size="small" @click="previewSurvey(survey.id)">
                    预览
                  </van-button>

                  <van-button plain class="action-button outline" size="small" @click="editSurvey(survey.id)">
                    编辑
                  </van-button>
                </template>

                <!-- 已发布状态下的分享按钮 -->
                <van-button v-if="survey.status === 'PUBLISHED'" plain class="action-button share-btn" size="small"
                  @click="openShareModal(survey.id)">
                  <van-icon name="share" size="16" />
                  分享
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 创建流程卡片（无问卷时显示） -->
      <div v-else class="creation-card">
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

      <!-- 底部内容 -->
      <div class="footer-content">
        <div class="consultation-link">
          <van-icon name="service" class="consult-icon" />
          <span>售前咨询</span>
        </div>

        <div class="footer-tip">
          绑定问卷星微信，第一时间获取答卷提醒
        </div>
      </div>
    </div>

    <!-- 问卷状态提示弹窗 -->
    <van-dialog v-model:show="showStatusDialog" :title="dialogTitle">
      <div class="dialog-content">
        {{ dialogMessage }}
      </div>
      <template #footer>
        <van-button round block type="primary" @click="showStatusDialog = false">确认</van-button>
      </template>
    </van-dialog>

    <!-- 分享模态框 -->
    <van-dialog v-model:show="showShareDialog" :title="`分享问卷 - ${currentSurveyTitle}`" class="share-dialog">
      <div class="dialog-content share-content">
        <div class="share-title">问卷填写链接：</div>
        <div class="url-container">
          <div class="survey-url">{{ shareUrl }}</div>
          <van-button class="copy-btn" size="small" type="primary" @click="copyToClipboard">
            复制链接
          </van-button>
        </div>
        <div class="share-title" style="margin-top: 24px">分享到：</div>
        <div class="share-icons">
          <div class="icon-item" @click="shareTo('wechat')">
            <div class="icon-circle bg-wechat">
              <van-icon name="wechat" size="28" color="white" />
            </div>
            <div class="icon-label">微信</div>
          </div>
          <div class="icon-item" @click="shareTo('qq')">
            <div class="icon-circle bg-qq">
              <van-icon name="qq" size="28" color="white" />
            </div>
            <div class="icon-label">QQ</div>
          </div>
          <div class="icon-item" @click="shareTo('weibo')">
            <div class="icon-circle bg-weibo">
              <van-icon name="weibo" size="28" color="white" />
            </div>
            <div class="icon-label">微博</div>
          </div>
          <div class="icon-item" @click="shareTo('qrcode')">
            <div class="icon-circle bg-primary">
              <van-icon name="qr" size="28" color="white" />
            </div>
            <div class="icon-label">二维码</div>
          </div>
        </div>
        <div v-if="isCopied" class="copy-message">链接已复制到剪贴板！</div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import dayjs from 'dayjs';

const router = useRouter();
const searchValue = ref('');
const isMenuOpen = ref(false);
const surveys = ref([]);
const userId = ref(null);

const showStatusDialog = ref(false);
const dialogTitle = ref('');
const dialogMessage = ref('');

// 分享相关状态
const showShareDialog = ref(false);
const shareUrl = ref('');
const currentSurveyTitle = ref('');
const isCopied = ref(false);

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  withCredentials: true
});

// 从 localStorage 获取用户信息
const getUser = () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    return JSON.parse(userData);
  }
  return null;
};

// 计算属性 - 是否有问卷
const hasSurveys = computed(() => {
  return surveys.value && surveys.value.length > 0;
});

// 计算属性 - 问候语
const greetingMessage = computed(() => {
  const user = getUser();
  if (user && user.username) {
    return `你好 ${user.username}`;
  }
  return '你好';
});

// 格式化日期
const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD');
};

// 格式化时间
const formatTime = (dateString) => {
  return dayjs(dateString).format('HH:mm');
};

// 获取问卷状态文本
const surveyStatusText = (status) => {
  switch (status) {
    case 'DRAFT': return '草稿';
    case 'PUBLISHED': return '已发布';
    case 'CLOSED': return '已结束';
    case 'ARCHIVED': return '已归档';
    default: return '未知状态';
  }
};

// 问卷状态对应的样式类
const statusClass = (status) => {
  const baseClass = 'status-tag';
  switch (status) {
    case 'DRAFT': return `${baseClass} status-draft`;
    case 'PUBLISHED': return `${baseClass} status-published`;
    default: return baseClass;
  }
};

// 获取用户问卷
const fetchUserSurveys = async () => {
  try {
    const user = getUser();
    if (!user || !user.id) return;

    const response = await api.get('/api/surveys/my', {
      params: {
        userId: user.id
      }
    });

    if (response.data && Array.isArray(response.data)) {
      surveys.value = response.data;
    }
  } catch (error) {
    console.error('获取问卷列表失败:', error);
  }
};

// 发布问卷
const publishSurvey = async (surveyId) => {
  try {
    await api.put(`/api/surveys/${surveyId}/publish`);
    fetchUserSurveys(); // 刷新列表
    // 发布后直接打开分享模态框
    const publishedSurvey = surveys.value.find(s => s.id === surveyId);
    if (publishedSurvey) {
      openShareModal(surveyId);
    }
  } catch (error) {
    console.error('发布问卷失败:', error);
  }
};

// 预览问卷
const previewSurvey = (surveyId) => {
  router.push({ name: 'SurveyPreview', params: { id: surveyId } });
};

// 编辑问卷
const editSurvey = (surveyId) => {
  router.push({ name: 'SurveyEditor', params: { id: surveyId } });
};

// 打开分享模态框
const openShareModal = (surveyId) => {
  const survey = surveys.value.find(s => s.id === surveyId);
  if (survey && survey.status === 'PUBLISHED') {
    currentSurveyTitle.value = survey.title;
    // 生成问卷分享链接（实际开发中应使用后端API获取）
    shareUrl.value = `${window.location.origin}/survey-answer/${surveyId}`;
    isCopied.value = false;
    showShareDialog.value = true;
  }
};

// 复制到剪贴板
const copyToClipboard = () => {
  navigator.clipboard.writeText(shareUrl.value).then(() => {
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  });
};

// 分享到不同平台
const shareTo = (platform) => {
  // 实际应用中应调用各个平台的分享API
  alert(`分享问卷到${platform}`);
};

onMounted(() => {
  // 检查用户是否登录
  const user = getUser();
  if (!user) {
    router.push({ name: 'LoginPage' });
    return;
  }

  userId.value = user.id;

  // 获取用户问卷
  fetchUserSurveys();
});

// 跳转到问卷填写页面
const goToSurveyFill = (surveyId, status) => {
  // 检查问卷状态
  if (status === 'PUBLISHED') {
    router.push({ name: 'SurveyAnswer', params: { id: surveyId } });
  } else {
    // 显示状态提示
    switch (status) {
      case 'DRAFT':
        dialogTitle.value = '问卷尚未发布';
        dialogMessage.value = '该问卷还在编辑中，请等待发布后再填写';
        break;
      case 'CLOSED':
        dialogTitle.value = '问卷已结束';
        dialogMessage.value = '该问卷已截止收集，不能再填写';
        break;
      case 'ARCHIVED':
        dialogTitle.value = '问卷已归档';
        dialogMessage.value = '该问卷已经归档，暂不开放填写';
        break;
      default:
        dialogTitle.value = '问卷状态异常';
        dialogMessage.value = '当前问卷状态不支持填写';
    }
    showStatusDialog.value = true;
  }
};

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
  router.push({ name: 'CreateQuestionnaire' });
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
      localStorage.removeItem('user');
      router.push({ name: 'RegisterPage' });
      break;
    default:
      console.warn('未知操作:', action);
  }
};
</script>

<style scoped>
/* 整体容器 */
.main-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  overflow: auto;
}

.nav-bar {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 100;
}

.menu-icon {
  color: #1989fa;
}

.content-section {
  flex: 1;
  padding: 16px;
  padding-top: 60px;
  /* 导航栏高度 */
  display: flex;
  flex-direction: column;
}

.user-greeting {
  padding: 16px 0;
  margin-bottom: 16px;
}

.greeting {
  font-size: 22px;
  font-weight: 500;
  color: #333;
}

.survey-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.survey-card {
  background-color: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.survey-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.status-tag {
  font-size: 14px;
  color: #666;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.status-draft {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-published {
  background-color: #f0fff4;
  color: #52c41a;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.time-section {
  display: flex;
  flex-direction: column;
}

.time {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.date {
  font-size: 14px;
  color: #666;
}

.info-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.question-count {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 0 15px;
  height: 32px;
  border-radius: 16px;
  font-weight: 500;
}

.action-button.outline {
  background-color: transparent;
  border: 1px solid #1989fa;
  color: #1989fa;
}

.action-button.share-btn {
  background-color: #f0f7ff;
  color: #1989fa;
  border: 1px solid #c6e2ff;
}

.footer-content {
  margin-top: auto;
  padding-top: 20px;
  text-align: center;
}

.consultation-link {
  display: inline-flex;
  align-items: center;
  color: #1989fa;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 10px;
}

.consult-icon {
  margin-right: 6px;
  font-size: 18px;
}

.footer-tip {
  font-size: 13px;
  color: #999;
  padding-bottom: 10px;
}

/* 创建卡片样式 */
.creation-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  margin-top: 15px;
}

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

.create-btn {
  border-radius: 30px;
  height: 48px;
  font-weight: 600;
  font-size: 16px;
}

/* 下拉菜单样式 */
.dropdown-menu {
  position: absolute;
  top: 46px;
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

/* 新增标题点击样式 */
.survey-title {
  position: relative;
  max-width: 70%;
}

.title-clickable {
  cursor: pointer;
  transition: all 0.3s ease;
  padding-right: 20px;
}

.title-clickable:hover {
  color: #1989fa;
}

.title-clickable:hover .fill-hint {
  opacity: 1;
}

.fill-hint {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  font-size: 12px;
  color: #1989fa;
  background: rgba(25, 137, 250, 0.08);
  padding: 2px 8px;
  border-radius: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

/* 弹窗内容样式 */
.dialog-content {
  padding: 20px;
  text-align: center;
  font-size: 16px;
  color: #333;
}

/* 分享弹窗样式 */
.share-dialog {
  border-radius: 16px;
  overflow: hidden;

  .van-dialog__header {
    padding-top: 16px;
    font-weight: 600;
    color: #333;
  }

  .share-content {
    padding: 16px;
    text-align: left;
  }

  .share-title {
    font-weight: 600;
    margin-bottom: 12px;
    color: #333;
  }

  .url-container {
    display: flex;
    align-items: center;
    background: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 10px 16px;
    margin-bottom: 8px;
  }

  .survey-url {
    flex: 1;
    font-size: 14px;
    color: #1989fa;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .copy-btn {
    margin-left: 10px;
    border-radius: 8px;
    font-weight: 500;
  }

  .share-icons {
    display: flex;
    justify-content: space-between;
    padding: 16px 24px;

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.05);
      }
    }

    .icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    .bg-wechat {
      background-color: #07c160;
    }

    .bg-qq {
      background-color: #12b7f5;
    }

    .bg-weibo {
      background-color: #e6162d;
    }

    .bg-primary {
      background-color: #1989fa;
    }

    .icon-label {
      font-size: 13px;
      color: #666;
    }
  }

  .copy-message {
    margin-top: 12px;
    text-align: center;
    font-size: 14px;
    color: #07c160;
    animation: fade 2s;
  }
}

@keyframes fade {
  0% {
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  80% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>