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
        <div class="greeting"> <span class="survey-name">{{ surveyTitle }}</span></div>
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
        <van-button block icon="plus" class="add-button" @click="showQuestionTypes">
          添加题目
        </van-button>
        <div class="tip-section">
          <van-icon name="warning" class="tip-icon" />
          <span class="tip-text">提示:添加性别、年龄等人口学题目，可以基于人口学题目做交叉对比分析。</span>
          <span class="action-link" @click="addDemographicQuestions">立即添加</span>
        </div>
      </div>

      <!-- 题目列表区域 -->
      <div class="question-list">
        <div v-if="questions.length === 0" class="placeholder">
          <van-icon name="notes-o" size="60" />
          <p>点击上方按钮添加题目</p>
        </div>

        <div v-for="(question, index) in questions" :key="question.id" class="question-item">
          <div class="question-header">
            <div class="question-type">{{ question.typeName }}</div>
            <div class="question-index">Q{{ index + 1 }}.</div>
          </div>
          <div class="question-content">
            {{ question.title }}
          </div>
          <div class="question-footer">
            <van-icon name="edit" size="20" @click="editQuestion(question.id)" />
            <van-icon name="delete" size="20" @click="deleteQuestion(question.id)" />
          </div>
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
      <div class="nav-button" @click="saveSurvey">
        <van-icon name="success" size="20" />
        <span>保存</span>
      </div>
    </div>

    <!-- 添加题目弹出层 -->
    <van-popup v-model:show="showQuestionTypeSelector" position="bottom" round :style="{ height: '70%' }">
      <div class="question-type-popup">
        <div class="popup-header">
          <div class="popup-title">选择题目类型</div>
          <van-icon name="cross" @click="showQuestionTypeSelector = false" />
        </div>

        <div class="type-grid">
          <!-- 基础题型 -->
          <div class="type-section">
            <div class="section-title">添加基础题型</div>
            <div class="type-row">
              <div v-for="type in basicTypes" :key="type.id" class="type-card" @click="selectQuestionType(type)">
                <van-icon :name="type.icon" size="24" />
                <span>{{ type.name }}</span>
              </div>
            </div>
          </div>

          <!-- 高级题型 -->
          <div class="type-section">
            <div class="section-title">添加题目模板</div>
            <div class="type-row">
              <div v-for="type in templateTypes" :key="type.id" class="type-card" @click="selectQuestionType(type)">
                <van-icon :name="type.icon" size="24" />
                <span>{{ type.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 题目编辑组件 -->
    <question-editor v-if="showQuestionEditor" :question="currentQuestion" @save="saveQuestion"
      @close="closeQuestionEditor" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Toast } from 'vant';
import QuestionEditor from './QuestionEditor.vue';
import { useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const questionIdCounter = ref(1);

// 问卷数据
const surveyTitle = ref('');
const questions = ref([]);
const showQuestionTypeSelector = ref(false);
const showQuestionEditor = ref(false);
const currentQuestion = ref(null);

// 题目类型定义
const basicTypes = [
  { id: 'single', name: '单选题', icon: 'edit', typeName: '单选题' },
  { id: 'multi', name: '多选题', icon: 'checked', typeName: '多选题' },
  { id: 'fill', name: '填空题', icon: 'description', typeName: '填空题' },
  { id: 'dropdown', name: '下拉题', icon: 'column', typeName: '下拉题' },
  { id: 'rating', name: '评分题', icon: 'pending', typeName: '评分题' },
  { id: 'sort', name: '排序题', icon: 'aim', typeName: '排序题' },
  { id: 'image', name: '图片题', icon: 'photo', typeName: '图片题' },
  { id: 'desc', name: '描述文字', icon: 'font', typeName: '描述文字' }
];

const templateTypes = [
  { id: 'name', name: '姓名', icon: 'user-o', typeName: '基本信息' },
  { id: 'gender', name: '性别', icon: 'friends-o', typeName: '基本信息' },
  { id: 'age', name: '年龄段', icon: 'calender-o', typeName: '基本信息' },
  { id: 'phone', name: '手机', icon: 'phone-o', typeName: '联系方式' },
  { id: 'date', name: '日期', icon: 'clock-o', typeName: '时间选项' },
  { id: 'region', name: '地区', icon: 'location-o', typeName: '地区选择' }
];

onMounted(() => {
  // 检查路由参数中是否有title
  if (route.query.title) {
    surveyTitle.value = route.query.title;
  } else {
    // 没有则使用默认标题
    surveyTitle.value = '未命名问卷';
  }
});

const closeEditor = () => {
  router.back();
};

const addSurveyInstruction = () => {
  Toast('添加问卷说明');
};

const switchTab = (tab) => {
  Toast(`切换到: ${tab}`);
};

const showQuestionTypes = () => {
  showQuestionTypeSelector.value = true;
};

const addDemographicQuestions = () => {
  // 添加基础信息题目
  ['name', 'gender', 'age', 'region'].forEach(typeId => {
    const type = templateTypes.find(t => t.id === typeId);
    if (type) {
      createNewQuestion(type);
    }
  });
  Toast('已添加基础信息题目');
};

const selectQuestionType = (type) => {
  showQuestionTypeSelector.value = false;
  createNewQuestion(type);
  showQuestionEditor.value = true;
};

const createNewQuestion = (type) => {
  const id = questionIdCounter.value++;

  const baseQuestion = {
    id,
    type: type.id,
    typeName: type.typeName || type.name,
    title: `请填写题目内容`,
    required: true
  };

  // 根据不同类型初始化数据结构
  if (type.id === 'single' || type.id === 'multi') {
    baseQuestion.options = [
      { id: 1, text: '选项一' },
      { id: 2, text: '选项二' }
    ];
  } else if (type.id === 'dropdown') {
    baseQuestion.options = [
      { id: 1, text: '选项一' },
      { id: 2, text: '选项二' }
    ];
  } else if (type.id === 'rating') {
    baseQuestion.max = 5;
    baseQuestion.label = '不满意,一般,满意';
  } else if (type.id === 'gender') {
    baseQuestion.options = [
      { id: 1, text: '男' },
      { id: 2, text: '女' }
    ];
  }

  currentQuestion.value = baseQuestion;
  showQuestionEditor.value = true;
};

const editQuestion = (id) => {
  const question = questions.value.find(q => q.id === id);
  if (question) {
    currentQuestion.value = { ...question };
    showQuestionEditor.value = true;
  }
};

const deleteQuestion = (id) => {
  Toast('删除题目');
  questions.value = questions.value.filter(q => q.id !== id);
};

const saveQuestion = (question) => {
  if (question.id) {
    // 更新现有题目
    const index = questions.value.findIndex(q => q.id === question.id);
    if (index !== -1) {
      questions.value[index] = question;
    }
  } else {
    // 添加新题目
    question.id = questionIdCounter.value++;
    questions.value.push(question);
  }
  showQuestionEditor.value = false;
};

const closeQuestionEditor = () => {
  showQuestionEditor.value = false;
};

const saveSurvey = () => {
  Toast('问卷保存成功');
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  padding: 16px;
  min-height: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.placeholder {
  text-align: center;
  padding: 40px 0;
  color: #969799;
}

.placeholder p {
  margin-top: 10px;
}

.question-item {
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  background-color: #fafafa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.question-type {
  font-size: 13px;
  padding: 2px 8px;
  background-color: #e1f5fe;
  color: #0288d1;
  border-radius: 4px;
}

.question-index {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.question-content {
  font-size: 15px;
  color: #333;
  margin-bottom: 12px;
}

.question-footer {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
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
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.popup-title {
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.type-grid {
  flex: 1;
  overflow-y: auto;
}

.type-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  color: #969799;
  margin-bottom: 12px;
}

.type-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background-color: #f7f8fa;
  border-radius: 8px;
  cursor: pointer;
  color: #333;
}

.type-card span {
  margin-top: 8px;
  font-size: 13px;
}
</style>