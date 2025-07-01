<template>
  <div class="survey-edit-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar safe-area-inset-top fixed>
      <template #title>
        <div class="nav-title">{{ surveyTitle }}</div>
      </template>
      <template #right>
        <van-icon name="close" size="20" @click="closeEditor" />
      </template>
    </van-nav-bar>

    <!-- 问卷主体内容 -->
    <div class="survey-container">
      <!-- 问卷标题和说明 -->
      <div class="welcome-section">
        <div class="greeting">你好 <span class="survey-name">{{ surveyTitle }}</span></div>
        <div class="add-instruction">
          <van-icon name="edit" class="edit-icon" />
          <span @click="addSurveyInstruction">添加问卷说明</span>
        </div>
      </div>
      
      <!-- 封面设置区域 -->
      <div class="cover-section">
        <div class="section-header">
          <div class="section-title">问卷封面设置</div>
          <div class="switch-view" @click="switchTab('effect')">
            效果示例 <van-icon name="arrow" />
          </div>
        </div>
        
        <div class="cover-options">
          <div class="option-card">
            <van-icon name="star" size="24" class="option-icon" />
            <div class="option-title">封面标题</div>
          </div>
          <div class="option-card">
            <van-icon name="description" size="24" class="option-icon" />
            <div class="option-title">封面描述</div>
          </div>
          <div class="option-card">
            <van-icon name="photo" size="24" class="option-icon" />
            <div class="option-title">封面图片</div>
          </div>
        </div>
      </div>
      
      <!-- 添加题目区域 -->
      <div class="add-question">
        <van-button 
          block 
          icon="plus" 
          class="add-button"
          @click="showQuestionTypes"
        >
          添加题目
        </van-button>
        <div class="tip-section">
          <van-icon name="warning" class="tip-icon" />
          <span class="tip-text">提示:添加性别、年龄等人口学题目，可以基于人工学题目做交叉对比分析。</span>
          <span class="action-link" @click="addDemographicQuestions">立即添加</span>
        </div>
      </div>
      
      <!-- 题目列表区域 -->
      <div class="question-list">
        <div class="placeholder">
          <van-image
            width="100"
            height="100"
            src="/src/assets/placeholder.png"
          />
          <p>点击上方按钮添加题目</p>
        </div>
      </div>
    </div>
    
    <!-- 底部功能栏 -->
    <div class="bottom-nav">
      <div class="nav-button">
        <van-icon name="todo-list" size="20" />
        <span>题目</span>
      </div>
      <div class="nav-button">
        <van-icon name="setting" size="20" />
        <span>设置</span>
      </div>
      <div class="nav-button">
        <van-icon name="eye" size="20" />
        <span>预览</span>
      </div>
      <div class="nav-button">
        <van-icon name="success" size="20" />
        <span>保存</span>
      </div>
    </div>
    
    <!-- 添加题目弹出层 -->
    <van-popup 
      v-model:show="showQuestionTypeSelector" 
      position="bottom" 
      round
      :style="{ height: '60%' }"
    >
      <div class="question-type-popup">
        <div class="popup-header">
          <div class="popup-title">选择题目类型</div>
          <van-icon name="cross" @click="showQuestionTypeSelector = false" />
        </div>
        
        <div class="type-grid">
          <div class="type-card">
            <van-icon name="edit" size="24" />
            <span>单选题</span>
          </div>
          <div class="type-card">
            <van-icon name="checked" size="24" />
            <span>多选题</span>
          </div>
          <div class="type-card">
            <van-icon name="description" size="24" />
            <span>填空题</span>
          </div>
          <div class="type-card">
            <van-icon name="column" size="24" />
            <span>下拉题</span>
          </div>
          <div class="type-card">
            <van-icon name="pending" size="24" />
            <span>评分题</span>
          </div>
          <div class="type-card">
            <van-icon name="aim" size="24" />
            <span>排序题</span>
          </div>
          <div class="type-card">
            <van-icon name="font" size="24" />
            <span>描述文字</span>
          </div>
          <div class="type-card">
            <van-icon name="photo" size="24" />
            <span>图片题</span>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 从路由参数获取问卷标题
const surveyTitle = ref('大学生消费情况调查问卷');
const showQuestionTypeSelector = ref(false);

const closeEditor = () => {
  router.back();
};

const addSurveyInstruction = () => {
  console.log('添加问卷说明');
};

const switchTab = (tab) => {
  console.log('切换到:', tab);
};

const showQuestionTypes = () => {
  showQuestionTypeSelector.value = true;
};

const addDemographicQuestions = () => {
  console.log('添加人口学题目');
};
</script>

<style scoped>
.survey-edit-page {
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
}

.van-nav-bar {
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.survey-container {
  flex: 1;
  padding: 16px;
  padding-top: 56px;
  padding-bottom: 70px;
  overflow-y: auto;
}

/* 欢迎区域 */
.welcome-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.greeting {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 16px;
}

.survey-name {
  color: #1989fa;
}

.add-instruction {
  display: flex;
  align-items: center;
  color: #969799;
  font-size: 14px;
  cursor: pointer;
}

.edit-icon {
  margin-right: 8px;
}

/* 封面设置区域 */
.cover-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
}

.switch-view {
  display: flex;
  align-items: center;
  color: #1989fa;
  font-size: 14px;
  cursor: pointer;
}

.cover-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background-color: #f7f8fa;
  border-radius: 8px;
  cursor: pointer;
}

.option-icon {
  margin-bottom: 8px;
  color: #1989fa;
}

.option-title {
  font-size: 13px;
  color: #333;
}

/* 添加题目区域 */
.add-question {
  margin-bottom: 16px;
}

.add-button {
  height: 48px;
  margin-bottom: 8px;
  background-color: #1989fa;
  color: #fff;
  border-radius: 12px;
  font-size: 16px;
}

.tip-section {
  display: flex;
  align-items: center;
  font-size: 13px;
  padding: 8px 12px;
  background-color: #fef6f6;
  border-radius: 6px;
  color: #e02e2e;
}

.tip-icon {
  margin-right: 6px;
  font-size: 14px;
}

.tip-text {
  flex: 1;
}

.action-link {
  color: #e02e2e;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
}

/* 题目列表区域 */
.question-list {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px 16px;
  min-height: 200px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  text-align: center;
  color: #969799;
}

.placeholder p {
  margin-top: 10px;
}

/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  display: flex;
  background-color: #fff;
  border-top: 1px solid #ebedf0;
  z-index: 101;
  justify-content: space-around;
}

.nav-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #646566;
  font-size: 12px;
  cursor: pointer;
}

/* 添加题目弹出层 */
.question-type-popup {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
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

.type-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: #f7f8fa;
  border-radius: 8px;
  cursor: pointer;
}

.type-card span {
  margin-top: 8px;
  font-size: 13px;
}
</style>