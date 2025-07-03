<template>
  <div class="create-survey-page">
    <!-- 顶部导航栏 - 添加了返回按钮 -->
    <van-nav-bar safe-area-inset-top fixed>
      <template #left>
        <van-icon name="arrow-left" size="20" class="back-icon" @click="handleBack" />
      </template>
      <template #title>
        <div class="nav-title">创建问卷</div>
      </template>
      <template #right>
        <van-dropdown-menu active-color="#1989fa">
          <van-dropdown-item v-model="activeType" :options="questionnaireTypes" title="切换问卷类型" />
        </van-dropdown-menu>
      </template>
    </van-nav-bar>

    <!-- 从空白创建区域 -->
    <div class="creation-section">
      <div class="creation-header">
        <div class="feature-icons">
          <van-icon name="like" />
          <van-icon name="cash-back-record" />
          <van-icon name="balance-pay" />
        </div>
        <div class="feature-tag">72种题型，强大逻辑设置，支持红包抽奖等功能</div>
      </div>

      <div class="title-input">
        <input type="text" v-model="surveyTitle" placeholder="请输入标题" @focus="showKeyboard = true" />
      </div>

      <div class="creation-buttons">
        <van-button round class="primary-btn" @click="createBlankSurvey">
          创建调查
        </van-button>
        <van-button round class="secondary-btn" @click="showAICreation = true">
          AI 创建问卷
        </van-button>
      </div>
    </div>

    <!-- 复制模板区域 -->
    <div class="template-section">
      <div class="section-header">
        <div class="section-title">复制模板问卷</div>
        <div class="learn-more">学习更多</div>
      </div>

      <van-search v-model="searchKeyword" shape="round" placeholder="搜索其他用户公开的问卷" />

      <div class="category-tabs">
        <van-tabs v-model="activeCategory">
          <van-tab v-for="category in categories" :key="category.value" :title="category.text" :name="category.value" />
        </van-tabs>
      </div>

      <div class="template-grid">
        <div v-for="(template, index) in filteredTemplates" :key="index" class="template-card">
          <div class="template-content">
            <div class="template-title">{{ template.title }}</div>
            <div class="template-stats">
              <span>共{{ template.questionCount }}题</span>
              <van-button round class="reference-btn" @click.stop="useTemplate(template)">
                引用
              </van-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI创建问卷弹窗 -->
    <van-popup v-model:show="showAICreation" round :style="{ width: '90%' }">
      <div class="ai-popup">
        <div class="popup-header">
          <div class="popup-title">AI创建问卷</div>
          <van-icon name="cross" @click="showAICreation = false" />
        </div>
        <div class="ai-description">
          <div>📝 AI智能问卷生成</div>
          <p>描述您想要的问卷内容，AI将为您智能生成完整的问卷</p>
        </div>
        <textarea placeholder="请描述您要创建的问卷内容，例如：我想创建一个关于大学生消费习惯的调查问卷，包含10个问题..." v-model="aiPrompt"></textarea>
        <van-button round block type="primary" class="ai-generate-btn">
          生成问卷
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { NavBar, DropdownMenu, DropdownItem, Search, Tab, Tabs, Popup, Button, Icon } from 'vant';

const surveyTitle = ref('');
const activeType = ref('all');
const searchKeyword = ref('');
const activeCategory = ref('all');
const showAICreation = ref(false);
const aiPrompt = ref('');
const showKeyboard = ref(false);
const router = useRouter();

// 问卷类型选项
const questionnaireTypes = ref([
  { text: '全部', value: 'all' },
  { text: '大学生', value: 'student' },
  { text: '企业调查', value: 'enterprise' },
  { text: '市场调查', value: 'market' },
  { text: '产品调查', value: 'product' },
  { text: '社会调查', value: 'social' },
  { text: '学生和学校', value: 'school' }
]);

// 分类选项
const categories = ref([
  { text: '全部', value: 'all' },
  { text: '大学生', value: 'student' },
  { text: '企业调查', value: 'enterprise' },
  { text: '市场调查', value: 'market' },
  { text: '产品调查', value: 'product' },
  { text: '社会调查', value: 'social' },
  { text: '学生和学校', value: 'school' }
]);

// 模板数据
const templates = ref([
  { id: 1, title: '大学生消费情况调查问卷', questionCount: 21, category: 'student' },
  { id: 2, title: '大学生恋爱观调查', questionCount: 20, category: 'student' },
  { id: 3, title: '大学生网购调查问卷', questionCount: 12, category: 'student' },
  { id: 4, title: '大学生课外阅读情况调查', questionCount: 14, category: 'student' },
  { id: 5, title: '关于大学生兼职情况的调查', questionCount: 12, category: 'student' },
  { id: 6, title: '大学生熬夜情况调查', questionCount: 7, category: 'student' },
  { id: 7, title: '大学生生活费情况调查', questionCount: 15, category: 'student' },
  { id: 8, title: '大学生就业意向调查', questionCount: 18, category: 'student' },
  { id: 9, title: '企业员工满意度调查问卷', questionCount: 10, category: 'enterprise' },
  { id: 10, title: '企业员工培训需求调查问卷', questionCount: 10, category: 'enterprise' },
  { id: 11, title: '产品用户体验调查问卷', questionCount: 15, category: 'product' },
  { id: 12, title: '社会公益参与意愿调查', questionCount: 12, category: 'social' },
]);

// 计算过滤后的模板
const filteredTemplates = computed(() => {
  return templates.value.filter(template => {
    // 匹配分类
    const categoryMatch = activeCategory.value === 'all' || template.category === activeCategory.value;
    // 匹配搜索关键词
    const keywordMatch = !searchKeyword.value ||
      template.title.toLowerCase().includes(searchKeyword.value.toLowerCase());
    return categoryMatch && keywordMatch;
  });
});

// 创建空白问卷
const createBlankSurvey = () => {
  if (!surveyTitle.value.trim()) {
    surveyTitle.value = '未命名问卷';
  }
  router.push({ name: 'QuestionnaireSet', query: { title: surveyTitle.value } });
};

// 使用模板
const useTemplate = (template) => {
  console.log('使用模板:', template.title);
};

// 处理返回操作
const handleBack = () => {
  router.back();
};

// 监听键盘显示/隐藏
watch(showKeyboard, (value) => {
  if (value) {
    setTimeout(() => {
      showKeyboard.value = false;
    }, 3000);
  }
});
</script>

<style scoped>
.create-survey-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow-y: auto;
  padding-bottom: 20px;
}

.van-nav-bar {
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.back-icon {
  color: #333;
  cursor: pointer;
  font-weight: bold;
}

.creation-section {
  background-color: #fff;
  border-radius: 16px;
  padding: 16px;
  margin: 16px;
  margin-top: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.creation-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.feature-icons {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.feature-icons .van-icon {
  background-color: #f0f7ff;
  color: #1989fa;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.feature-tag {
  background-color: #f6f9ff;
  color: #1989fa;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
}

.title-input {
  margin-bottom: 20px;
}

.title-input input {
  width: 100%;
  height: 48px;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 16px;
  box-sizing: border-box;
  background-color: #f9f9f9;
  transition: border-color 0.3s;
}

.title-input input:focus {
  color: #222;
  border-color: #1E62FF;
  outline: none;
  box-shadow: 0 0 0 2px rgba(30, 98, 255, 0.1);
}

.title-input input::placeholder {
  color: #aaa;
}

.creation-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.primary-btn {
  background: linear-gradient(135deg, #1989fa, #1e62ff);
  color: white;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  box-shadow: 0 4px 8px rgba(25, 137, 250, 0.2);
  transition: all 0.3s;
}

.primary-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 4px rgba(25, 137, 250, 0.2);
}

.secondary-btn {
  background-color: white;
  color: #1989fa;
  border: 1px solid #1989fa;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
}

.secondary-btn:active {
  background-color: #f5f9ff;
}

.template-section {
  background-color: #fff;
  border-radius: 16px;
  padding: 16px;
  margin: 0 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.learn-more {
  font-size: 13px;
  color: #1989fa;
  font-weight: 500;
}

:deep(.van-search) {
  background-color: transparent;
  padding: 0;
  margin-bottom: 16px;
}

:deep(.van-search__content) {
  background-color: #f5f7fa;
  border-radius: 20px;
}

.category-tabs {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f7fa;
}

:deep(.van-tabs__wrap) {
  height: 40px;
  background-color: transparent;
}

:deep(.van-tab) {
  font-size: 13px;
  padding: 0 8px;
}

:deep(.van-tab--active) {
  font-weight: 600;
  color: #1989fa;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.template-card {
  background-color: #f9fafc;
  border-radius: 12px;
  padding: 12px;
  position: relative;
  overflow: hidden;
  height: 120px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.template-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f0f7ff;
}

.template-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.template-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.template-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #969799;
}

.reference-btn {
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
  background-color: #1989fa;
  color: white;
  border: none;
  font-weight: 500;
}

.reference-btn:active {
  opacity: 0.9;
}

.ai-popup {
  padding: 20px;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.popup-title {
  font-size: 18px;
  font-weight: 600;
}

.ai-description {
  background-color: #f0f7ff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  color: #1989fa;
  font-size: 15px;
  line-height: 1.5;
}

.ai-description p {
  color: #666;
  font-size: 13px;
  margin-top: 8px;
}

textarea {
  width: 100%;
  height: 120px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  margin-bottom: 20px;
  resize: none;
  box-sizing: border-box;
  font-family: inherit;
}

textarea:focus {
  border-color: #1989fa;
  outline: none;
  box-shadow: 0 0 0 2px rgba(25, 137, 250, 0.1);
}

.ai-generate-btn {
  height: 48px;
  font-weight: 500;
  background: linear-gradient(135deg, #1989fa, #1e62ff);
  border: none;
}

.ai-generate-btn:active {
  opacity: 0.9;
}
</style>