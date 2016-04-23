
<template>
	<div>
		
		<!-- if on user/team, allow someone to write to wall -->
		<div v-if="type !== 'home'" class="Feed__post">
			<div class="Feed__write">
				<div v-if="!newPost" class="Feed__thumbnail Feed__thumbnail--write">
					<i class="Feed__icon material-icons">textsms</i>
				</div>
				<div v-else class="Feed__thumbnail Feed__thumbnail--write submit-button" @click="postNewPost">
					<span>Submit</span>
				</div>
				<div class="Feed__input">
					<div class="arrow-left"></div>
						<form>
							<textarea v-autosize="newPost" rows="1" placeholder="Write a new post..." class="form-control"
												v-model="newPost" required></textarea>
						</form>					
				</div>
			</div>
		</div>


		<!-- start of the news feed -->
		<div class="Feed">
			<div v-for="(index, day) in entries" transition="slide-md" class="Feed__day">
				<div v-if="day.length" class="Feed__date">
					<span><i class="material-icons">date_range</i>
						{{ day[0].date }}
					</span>
				</div>
				<div class="Feed__line"></div>

				<div v-for="entry in day" transition="slide-md" class="Feed__entry">
					<div class="Feed__thumbnail" :class="entry.iconClass">
						<i class="Feed__icon material-icons">{{ entry.icon }}</i>
					</div>
					<div class="Feed__text">
						<div class="Feed__creator">
							<a v-link="{name: 'user', params: {name: lookupPlayer(entry.creator).username}}">{{ lookupPlayer(entry.creator).name }}</a>
							<span :title="entry.hoverDate" class="Feed__timestamp">
								<span class="bullet">&bull;</span>
								{{ entry.timestamp }}
								<i v-if="showDelete(entry.creator)" id="deleteIcon" class="material-icons" 
										title="Delete Post" @click="deletePost(entry, index)">clear</i>
							</span>
						</div>

						<!-- new event -->
						<div v-if="entry.type === 0" class="Feed__subject">
							<span>The event <a class="event-trigger" :data-event-id="entry.event_id">{{ entry.title }}</a> has been added to the calendar</span>
						</div>


						<!-- event edited -->
						<div v-if="entry.type === 1" class="Feed__subject">
							<span>The event <a class="event-trigger" :data-event-id="entry.event_id">{{ entry.title }}</a> has been edited</span>
						</div>

						<!-- event canceled -->
						<div v-if="entry.type === 2" class="Feed__subject">
							<span>The event {{ entry.title }} has been canceled</span>
						</div>

						<!-- stats posted -->
						<div v-if="entry.type === 4" class="Feed__subject">
							<span>Stats for the game <a class="event-trigger" :data-event-id="entry.event_id">{{ entry.title }}</a> have been posted</span>
						</div>

						<!-- if this is a canceled event, show strikethrough date -->
						<div v-if="entry.type === 2" class="Feed__entry__date--canceled">
							<span>{{ entry.start | formatTimeString entry.end }}</span>
						</div>
						<!-- otherwise just show date -->
						<div v-if="entry.type < 2" class="Feed__entry__date">
							<span>{{ entry.start | formatTimeString entry.end }}</span>
						</div>

						<!-- if this event repeats, display which days -->
						<div v-if="entry.repeats" class="Feed__entry__repeats">
							<span>{{ entry.repeats | formatRepeatString }}</span>
						</div>

						<!-- if there's any extra details -->
						<blockquote v-if="entry.details" class="Feed__details">
							<p>{{ entry.details }}</p>
						</blockquote>
						
						<!-- if stats are posted, display the outcome of the game -->
						<!-- away team's score is always displayed first -->
						<blockquote v-if="entry.type === 4" class="Feed__details">
							<p :class="entry.awayClass">{{ entry.awayName }} - {{ entry.awayScore }}</p>
							<p :class="entry.homeClass">{{ entry.homeName }} - {{ entry.homeScore }}</p>	
						</blockquote>
					</div>
				</div>

			</div>
		</div>


	</div>
</template>


<script>


//NewsFeed handles some of its own state without notifying parent. this 
//is mostly due to the fact that there are transitions and for the most
//part, the data here is inconsequential to the rest of the page

export default  {
	
	name: 'NewsFeed',

	props: ['type', 'users', 'name', 'feed'],


	data() {

		return {
			newPost: '',
			entries: [[]],
		}
	},

	watch: {
		feed() {
			this.entries = [[]];
			this.compile();
		}
	},


	events: {
		//new feed entry from Team has been sent
		updateFeed(entry) {
			//add to the feed, 'true' means this is a brand new post
			this.format(entry, true);
		}
	},

	methods: {

		//iterate through all raw feed data, format and add to the news feed
		compile() {
			
			var self = this;
			this.feed.forEach(function(entry) {
				//the 'false' means these aren't brand new posts
				self.format(entry, false);		
			})

			this.entries.splice(0, 1); //remove empty placeholder spot in feed array
		},

		//for deciding whether or not to show the 'delete' icon in feed
		//show if owner of entry or if team admin
		showDelete(creator) {
			var admin = this.$parent.admin;
			var auth = this.$parent.auth.id;

			if(this.type === 'team' && admin)
				return true;

			else if(this.type === 'team' && creator === auth)
				return true;

			else 
				return false;
		},

		//delete an entry in the news feed
		deletePost(entry, index) {

			//remove from the news feed array
			this.entries[index].$remove(entry);

			var self = this;
			var url = this.$parent.prefix + '/feed/' + entry.id;
			this.$http.delete(url)
			.then(function(response) {
				//successful ajax request
				self.$root.banner('good', 'This post has been deleted');
			})
			.catch(function() {
				//failed ajax request
				self.$root.banner('bad', "There was a problem deleting this post, try refreshing the page.");
			})
		}, 

		//when a fan/coach/player writes to the team wall
		postNewPost() {

			var entry = {};
			var createdDate = moment();
	
			entry.date = 'Today';
			entry.creator = this.$parent.auth.id;
			entry.timestamp = createdDate.format('h:mm a'); //timestamp on post
			entry.hoverDate = createdDate.format('M/D/YYYY h:mm:ss a'); //hover text on timestamp
			entry.icon = 'textsms';
			entry.iconClass = 'Feed__thumbnail--write';
			entry.type = 3;
			entry.details = this.newPost;

			this.addToFeed(entry, true);

			this.newPost = '';

			var self = this;
			var url = this.$parent.prefix + '/feed';
			this.$http.post(url, {post: entry.details})
			.then(function(response) {
				//successful ajax post, dynamically add post to the feed
				self.$root.banner('good', 'Your post has been added to the team feed');

				//attach the correct id now that we have the response back (in case they need to delete their post)
				self.entries[0][0].id = response.data.id;
			})
			.catch(function() {
				//failed ajax request
				self.$root.banner('bad', "There was a problem with your post, try refreshing the page.")
			})
		},


		//format raw data into news feed
		format(feed, isNewPost) {

			//for each object in news feed, group into which day it was formed on
			var entry = {};
			var meta = JSON.parse(feed.meta);
			var createdDate = moment.utc(feed.created_at, 'YYYY-MM-DD HH:mm:ss').local();

			//create a datestamp for sorting days that have feed entries
			var date = createdDate.format('ddd. MMMM Do');

			//if last year, include year in datestamp
			if(createdDate.isBefore(moment().startOf('year')))
				date = createdDate.format('ddd. MMMM Do, YYYY');

			//for readability, if the date is closeby, use human format
			if(moment().subtract(1, 'day').isSame(createdDate, 'day'))
				date = 'Yesterday';

			if(moment().isSame(createdDate, 'day'))
				date = 'Today';


			entry.date = date;
			entry.creator = feed.creator_id;
			entry.id = feed.id;
			entry.timestamp = createdDate.format('h:mm a'); //timestamp on post
			entry.hoverDate = createdDate.format('M/D/YYYY h:mm a'); //hover text on timestamp
			entry.type = feed.type;

			if(entry.type <= 2) {
				//event-type feed entries
				entry.title = meta.event.title;
				entry.event_id = meta.event.id;
				entry.start = meta.event.start;
				entry.end = meta.event.end;
				if(entry.type != 2) entry.details = meta.event.details;

				//choose the right icon depending on type
				switch(entry.type) {
					case 0:
						entry.icon = 'add';
						entry.iconClass = 'Feed__thumbnail--newEvent';
						break;
					case 1:
						entry.icon = 'refresh';
						entry.iconClass = 'Feed__thumbnail--updateEvent';
						break;
					case 2:
						entry.icon = 'remove';
						entry.iconClass = 'Feed__thumbnail--cancelEvent';
						break;
				}

				if(meta.repeats)
					//if this is a repeating event, display which days and until when
					entry.repeats = meta.repeats;

			}

			if(entry.type === 3) {
				//user written post to the team feed
				entry.details = meta.details;
				entry.icon = 'textsms';
				entry.iconClass = 'Feed__thumbnail--write';
				entry.type = 3;
			}

			if(entry.type === 4) {
				//stats for an event have been posted
				entry.title = meta.event.title;
				entry.event_id = meta.event.id;
				entry.icon = 'trending_up';
				entry.iconClass = 'Feed__thumbnail--stats';
				entry.type = 4;
				entry = this.formatGameOutcome(entry, meta);
			}

			//add this entry to the entries array
			this.addToFeed(entry, isNewPost);

		},


		//turn raw data into an array that can be iterated on by Vue
		//first layer of array are days in which something happened on the team page
		//inside those arrays are arrays of this data we just set up above
		//if isNewPost is true, add to top of array (to maintain chronological order)
		addToFeed(entry, isNewPost) {

			for(var x = 0; x < this.entries.length; x++) {
			
				if(this.entries[x].length) {
					//there's an entry on this date already, check if correct date
					if(this.entries[x][0].date === entry.date) {
						//this is the correct spot in the array, push new entry
						if(isNewPost) {
							this.entries[x].unshift(entry);
							break;
						}
						else {
							this.entries[x].push(entry);
							break;
						}	
					}
				}

				if(isNewPost) {
					//brand new post, and the date 'Today' doesn't exist (would've stopped in above conditional)
					//add this entry to top of news feed
					this.entries.unshift([entry]);
					break;
				}

				if(x === (this.entries.length - 1)) {
					//couldn't find a suitable spot, push new date onto array
					this.entries.push([entry]);
					break;
				}

			}

		},

		//returns name of player/coach 
		lookupPlayer(id) {
			//returns the name of the player when given an id
			var match = {};
			match = this.users.filter(function(user) {
				return user.id === id;
			});

			if(match.length) {
				//if there is at least one match, take the first (and only) match
				return {
					name: match[0].firstname + " " + match[0].lastname,
					username: match[0].username,
				}
			}
			else
				return "ERROR";
		},

		//choose css classes for who won, which was home/away
    formatGameOutcome(entry, meta) {

			if(meta.event.class === 1) {
				//home game
				entry.homeScore = meta.teamScore;
				entry.awayScore = meta.oppScore;
				entry.homeName = meta.team;
				entry.awayName = meta.opp;
			}
			else {
				//home game
				entry.homeScore = meta.oppScore;
				entry.awayScore = meta.teamScore;
				entry.homeName = meta.opp;
				entry.awayName = meta.team;
			}

			if(entry.awayScore > entry.homeScore) {
				//team won
				entry.awayClass = 'win';
				entry.homeClass = 'loss';
			}
			if(entry.awayScore < entry.homeScore) {
				//team won
				entry.awayClass = 'loss';
				entry.homeClass = 'win';
			}
			if(entry.awayScore === entry.homeScore) {
				//team won
				entry.awayClass = 'win';
				entry.homeClass = 'win';
			}

			return entry;
    }
	},

	

};

</script>


<style lang="stylus">

//we need the colors here
@import '/resources/assets/stylus/variables.styl'

.Feed
	display flex
	flex-flow column
	align-items center
	padding 0px 2em


.Feed__line
	position absolute
	left 23px
	width 0
	height 100%
	border 2px dashed darken(whitesmoke, 15%)
	@media screen and (max-width 500px)
		left 18px

.Feed__post
	display flex
	justify-content center
	padding 0 2em
	.Feed__thumbnail
		height 54px
		width 54px
		margin-right 2em
		font-size 18px
		@media screen and (max-width 500px)
			width 34px
			height 34px

.Feed__write
	flex 1
	display flex
	max-width 775px
	margin-bottom 7em
	.Feed__input
		width 100%
		position relative
		.arrow-left
			position absolute
			top 13px
			left -10px
			@media screen and (max-width 500px)
				top 8px
	.submit-button
		&:hover
			cursor pointer
		span
			font-size 14px
			color white
			@media screen and (max-width 500px)
				font-size 9px

.Feed__day
	flex 1
	position relative
	min-width 775px
	margin-top 3em
	overflow hidden
	@media screen and (max-width 831px)
		min-width 0	
	&:first-child
		margin-top 0
		

.Feed__date
	text-align center
	margin-bottom 2em
	span
		color rc_med_gray
		position relative
		padding-left 25px
		i
			position absolute
			left -3px
			top -3px
			font-size 21px

.Feed__entry
	flex 1
	display flex
	margin-bottom 5em
	&:last-child
		margin-bottom 1em

.Feed__text
	font-size 16px
	max-width 700px
	display flex
	flex-flow column
.Feed__creator
	margin-bottom 1em
	font-size 14px
.Feed__timestamp
	position relative
	margin-left 15px
	color darken(whitesmoke, 35%)
	.bullet
		position absolute
		left -13px
		top -5px
		font-size 20px
	#deleteIcon
		font-size 18px
		position absolute
		right -25px
		top -1px
		&:hover
			cursor pointer
			
.Feed__subject
	margin-bottom 0.7em		
.Feed__details
	border-left 5px solid rc_lite_gray
	font-weight bold
	margin-bottom 0
	.win
		font-weight bold
	.loss
		color rc_dark_gray
		font-weight lighter

.Feed__entry__date
	margin-bottom 0.7em
	&--canceled
		text-decoration line-through
		margin-bottom 1em

.Feed__entry__repeats
	margin-bottom 1em	
	color rc_med_gray




.Feed__thumbnail
	display flex
	justify-content center
	align-items center
	width 50px
	height 50px
	border-radius 50%
	padding 20px
	margin-right 2em
	z-index 10
	@media screen and (max-width 500px)
		width 30px
		height 30px
		margin-right 2em
	.Feed__icon
		font-size 30px
		@media screen and (max-width 500px)
			font-size 18px
	&--write
		background rc_blue
		color white
	&--stats
		background rc_orange
		color white
	&--newEvent
		background rc_green
		color white
	&--updateEvent
		background rc_yellow
		color white
	&--cancelEvent
		background rc_red
		color white
				

.arrow-left
	height 0
	width 0
	border-bottom 10px solid transparent		
	border-top 10px solid transparent
	border-right 10px solid whitesmoke


</style>