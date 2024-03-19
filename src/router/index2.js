import {createRouter,createWebHistory} from "vue-router";
const router = createRouter({
    mode:'history',
    history: createWebHistory(import.meta.BASE_URL),
    routes:[
        {
            path:'/',
            redirect:'/music',
        },
        {

        }
    ]
});

router.beforeEach((to   , from  ,next)=>{
    if(to.meta.title){
        document.title = to.meta.title+"-Electro 在线音乐播放器";
    }
    next();
});