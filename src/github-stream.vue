<template>
  <div class="github">
    <header class="github__header">
      <h1>Github Stream of {{ actor.name }}</h1>
    </header>
    <div class="github__stream" v-bind:style="{ 'max-height': this.size + 'px' }" v-bind:class="{ 'github__stream--expanded': expanded}">
      <div v-if="error.lenght == 0">
        <p class="github__stream--error">{{ error.message }}</p>
      </div>
      <ul class="github__activities">
        <li class="activity" v-for="activity in activities | orderBy 'id' -1" track-by="id">
          <i class="activity__icon {{ activity.type.icon}} octicon"></i>
          <span class="activity__action">{{ activity.type.name }} at {{ activity.repository.name}}</span>
          <small class="activity__date">{{ activity.date }}</small>
        </li>
      </ul>
      <div class="github__expander" @click="this.expanded = !this.expanded">
        <div v-if="!expanded">More Activities</div>
        <div v-else>Less Activities</div>
      </div>
    </div>
  </div>
</template>

<script>
"use strict";

// Third party libraries the only dependency we have in order to created
// a nice human-like timestamp
import moment from "moment";

export default {
   // Attributes that come from the HTML Tag
   // Useful for some settings
  props: {
      user: "",
      height: 0,
      maxHeight: 0,
      polling: 60000,
  },

  data() {
    return {
      api: {
        base: "https://api.github.com/users/",
        activities: "/events/public"
      },
      actor: {
        name: "",
        avatar: "",
      },
      expanded: false,
      activities: [],
      error: "",
    };
  },

  // Once the Vue instance is ready we start the first pull with the polling system
  ready() {
    this.$http.get(this.api.base + this.user)
    .then(function(response) {
      this.actor.name = response.data.login;
      this.actor.avatar = response.data.avatar_url
    }, function(error) {
      this.error = "Could not fetch the Github user profile!";
    });

    this.updateStream();
  },

  methods: {
    // Update the current user's stream
    updateStream() {
      this.$http.get(this.api.base + this.user + this.api.activities)
      .then(function(response) {
        this.fillActivities(response.data);

        // Primitive polling system
        setTimeout(this.updateStream, this.polling);

      }, function(error) {
        this.error = "Could not fetch the Github activity right now!";
      });
    },

    // Primitive translation system for each Github Event
    translateActivity(activity, payload) {
      var activity = activity.toLowerCase();
      switch(activity) {
        case "createevent":
          return {
            name: "Created a Tag",
            icon: "octicon-tag",
          };
        case "releaseevent":
          return {
            name: "Released a New Version",
            icon: "octicon-tag",
          };
        case "pushevent":
          var branchName = payload.ref.split("/");
          return {
            name: "Pushed to " + branchName[2],
            icon: "octicon-git-commit",
          };
        case "issuesevent":
          if(payload.action === "closed") {
            return {
              name: "Closed an Issue",
              icon: "octicon-issue-closed",
            };
          }
          return {
            name: "Opened an Issue",
            icon: "octicon-issue-opened",
          };
        case "issuecommentevent":
          return {
            name: "Comment on an Issue",
            icon: "octicon-comment-discussion",
          };
        case "forkevent":
          return {
            name: "Forked",
            icon: "octicon-git-branch",
          };
        case "pullrequestevent":
          return {
            name: "Merged pull request",
            icon: "octicon-git-pull-request",
          }
        case "watchevent":
          return {
            name: "Starred a Repository",
            icon: "octicon-star",
          };
        case "gollumevent":
          return {
            name: "Edited the Wiki",
            icon: "octicon-book",
          };
        default:
          return {
            name: activity,
            icon: "",
          };
      };
    },

    // We need a little wrapper that creates a dedicated activity object for
    // each github events fetched
    fillActivities(events) {
      var that = this;
      events.forEach(function(event) {
        var activity = {
          id: event.id,
          type: that.translateActivity(event.type, event.payload),
          repository: event.repo,
          date: moment(event.created_at).fromNow(),

        };
        // This is a bit ghetto, but it's the only way i know atm
        // that allows me to append the new activity
        var founded = false;
        for(var i = 0; i < that.activities.length; ++i) {
            if (that.activities[i].id == activity.id) {
                founded = true;
                break;
            }
        }
        if(!founded) {
          that.activities.push(activity);
        }
      });
    },
  },

  computed: {
    // Simply return the current size for the HTML Element
    size() {
      return  (!this.expanded) ? this.height : this.maxHeight;
    },
  },
}
</script>

<style lang="stylus">
.github
  background-color white
  box-shadow 0 1px 4px 0 rgba(0, 0, 0, 0.14)
  flex 0 0 auto
  width calc(99.99% * 1/2 - (30px - 30px * 1/2))
  height calc(99.99% * 1/2 - (30px - 30px * 1/2))
  outline none
  z-index 1

  @media(max-width: 995px)
    width 99.99%

.github__header
  background: #f9f9f9;
  box-sizing: border-box;
  padding 0.5em
  margin: 0;
  position: relative;

  > h1
    margin 0

.github__stream
  overflow hidden
  position relative
  transition all .3s ease

.github__stream--expanded
  transition all .3s ease

.github__expander
  background-color #e7e7e7
  bottom 0
  cursor pointer
  height 2em
  margin auto
  position absolute
  text-align center
  width 100%

  > div
    vertical-align middle
    padding-top 5px

.github__activities
  list-style none

.activity
  padding 5px 0px 5px 20px

.activity__icon
    vertical-align middle
    width 20px

.activity__action
  color inherit

.activity__date
    color #cccccc
</style>
