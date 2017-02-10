<template>
  <div class="Home">
  
    <div class="greeting">
      <h1>Welcome to the Rookiecard Alpha!</h1>
      <template v-if="isDemoUser">
        <p class="subtitle">I see you're on the demo account, feel free to check out the sample team by going to <strong>Teams > UNH Wildcats</strong></p>
        <p class="subtitle">Or perhaps you want to make your own... just go to <strong>Teams > Create a Team</strong></p>
      </template>
      <p class="subtitle" v-else>Feel free to create your own team by going to Teams > Create a Team</p>

      <p class="instructions">Poke around, find bugs, report them in <strong>Options > Submit Feedback</strong></p>
      <p class="thank-you">Thanks for checking it out!</p>
    </div>

  </div>
</template>

<script>

export default  {
  
name: 'Home',

props: [],

data()
{
  return {

  }
},

computed: {
  isDemoUser() {
    return this.$root.user.username === 'demo';
  },
},

methods:
{
  
},
};

</script>

<style lang="stylus">

.Home
  display flex
  height 100vh
  justify-content center
  align-items center
  
  .greeting
    text-align center
    .subtitle
      font-size 16px
      margin-top 2rem
    .instructions
      font-size 17px
      margin-top 4rem
    .thank-you
      font-size 20px
      margin-top 4rem


</style>