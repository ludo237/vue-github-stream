"use strict"

import Vue from "vue";
import Resource from "vue-resource";
import Github from "../../src/github-stream.vue";

Vue.use(Resource);

new Vue({
    el: "body",
    components: { Github }
});