<script setup>
import ElectroDialog from "base/electroDialog/ElectroDialog.vue";
import { useUserStore } from "@/stores/user";
import { getUserDetails } from "apis/userinfo";
import { storeToRefs } from "pinia";
import { ref, computed, onMounted } from "vue";
import { showToast } from "base/electroToast/index";
import { toHttps } from "@/utils/util";

const userStore = useUserStore();
const { uid, avatarUrl, nickname } = storeToRefs(userStore);
const { setUid, setAvatarUrl, setNickname } = userStore;

const uidValue = ref("");
// 弹窗模板引用
const loginDialog = ref(null);
const helpDialog = ref(null);
const logoutDialog = ref(null);

const isLoggedin = computed(() => {
    return uid.value !== "";
});

onMounted(() => {
    uid.value && getUserInfo(uid.value);
});

const opendialog = (type) => {
    switch (type) {
        case "login":
            loginDialog.value.show();
            break;
        case "help":
            loginDialog.value.hide();
            helpDialog.value.show();
            break;
        case "logout":
            logoutDialog.value.show();
            break;
    }
};

const login = () => {
    if (uidValue.value === "") {
        showToast({ message: "UID 不能为空", position: "top" });
        opendialog("login");
        return;
    }
    getUserInfo(uidValue.value);
    uidValue.value = "";
};

const logout = () => {
    setUid("");
    setAvatarUrl("");
    setNickname("");
    uidValue.value = "";
    showToast({ message: "退出成功!", position: "top" });
};

const getUserInfo = async (uid) => {
    const userDetails = await getUserDetails(uid);
    const { profile } = userDetails;
    if (profile === undefined) {
        showToast({ message: `未找到 UID 为 ${uid} 的用户信息`, position: "top" });
        return;
    }
    const { avatarUrl, nickname } = profile;
    setUid(uid);
    setAvatarUrl(toHttps(avatarUrl));
    setNickname(nickname);
    setTimeout(() => {
        showToast({
            message: `${nickname} 欢迎使用 Electro Player`,
            position: "top",
        });
    }, 200);
};
</script>

<template>
    <header class="electro-header"></header>
</template>

<style lang="less" scoped>
.electro-header {
    position: absolute;
    top: 0px;
    left: 0;
    width: 100%;
    height: 1px;
    @media (max-width: 768px) {
        background-color: @header_bg_color;
    }

    .header {
        .flex-center;
        font-style: italic;
        a {
            padding: 0 10px;
            line-height: 60px;
            font-size: 20px;
            font-weight: 800;
            color: transparent;
            background: url("assets/slideImg/silver.jpg");
            background-position: 30% 30%;
            text-align: center;
            background-clip: text;
            -webkit-background-clip: text;
            animation: slide-img 20s linear infinite alternate-reverse forwards;
        }

        // media
        @media (max-width: 768px) {
            padding-left: 15px;
            justify-content: flex-start;
        }
        @media (max-width: 414px) {
            font-size: @font_size_medium;
        }
    }

    .user {
        position: absolute;
        top: 50%;
        right: 15px;
        line-height: 30px;
        text-align: right;
        transform: translateY(-50%);
        display: flex;
        gap: 15px;
        &-info {
            cursor: pointer;
            .avatar {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                vertical-align: middle;
            }
            .user-name {
                display: inline-block;
                margin-left: 10px;
                color: @text_color_active;
            }
        }
        &-btn {
            cursor: pointer;
            &:hover {
                color: @text_color_active;
            }
        }

        @media (max-width: 768px) {
            &-info {
                margin-right: 10px;
                span {
                    display: none;
                }
            }
        }
    }
}

.electro-dialog-text {
    text-align: left;
    .electro-dialog-input {
        width: 100%;
        height: 40px;
        box-sizing: border-box;
        padding: 0 15px;
        border: 1px solid @btn_color;
        outline: 0;
        background: transparent;
        color: @text_color_active;
        font-size: @font_size_medium;
        box-shadow: 0 0 1px 0 #fff inset;
        &::placeholder {
            color: @text_color;
        }
    }
    a:hover {
        color: #d43c33;
    }
}

@keyframes slide-img {
    0% {
        background-position: 30% 30%;
    }
    100% {
        background-position: 70% 70%;
    }
}
</style>
