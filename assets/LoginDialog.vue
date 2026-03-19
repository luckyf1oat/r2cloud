<script setup>
import { reactive } from "vue";

defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue", "login"]);

const form = reactive({
  username: "",
  password: "",
});

function closeDialog() {
  emit("update:modelValue", false);
}

function submitLogin() {
  if (!form.username || !form.password) {
    alert("请输入用户名和密码");
    return;
  }
  emit("login", { username: form.username, password: form.password });
  emit("update:modelValue", false);
  form.password = "";
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="modelValue"
      class="login-mask"
      @click.self="closeDialog"
    >
      <div class="login-card">
        <div class="login-title">用户登录</div>
        <div class="login-body">
          <label>
            <span>用户名</span>
            <input
              v-model.trim="form.username"
              type="text"
              autocomplete="username"
              placeholder="请输入用户名"
              @keydown.enter.prevent="submitLogin"
            />
          </label>
          <label>
            <span>密码</span>
            <input
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              placeholder="请输入密码"
              @keydown.enter.prevent="submitLogin"
            />
          </label>
        </div>
        <div class="login-actions">
          <button type="button" class="btn cancel" @click="closeDialog">取消</button>
          <button type="button" class="btn confirm" @click="submitLogin">登录</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.login-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: min(92vw, 360px);
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.login-title {
  font-size: 16px;
  font-weight: 600;
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
}

.login-body {
  padding: 14px 16px;
  display: grid;
  gap: 10px;
}

.login-body label {
  display: grid;
  gap: 6px;
}

.login-body span {
  font-size: 12px;
  color: #666;
}

.login-body input {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 10px;
  outline: none;
}

.login-body input:focus {
  border-color: #2196f3;
}

.login-actions {
  padding: 12px 16px 14px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
}

.btn.cancel {
  background: #f3f4f6;
  color: #333;
}

.btn.confirm {
  background: #2196f3;
  color: #fff;
}

.btn.confirm:hover {
  background: #1976d2;
}
</style>
