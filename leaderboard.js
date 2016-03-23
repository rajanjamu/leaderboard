PlayerList = new Mongo.Collection('players');

if(Meteor.isClient){
	Meteor.subscribe('thePlayers');
	
	Template.leaderboard.helpers({
	  'player': function(){
	    var currentUserId = Meteor.userId();
	    return PlayerList.find({}, {sort: {score: -1, name: 1} });
	  },
	  'selectedClass': function() {
	    var playerId = this._id;
	    var selectedPlayer = Session.get('selectedPlayer');
	    if(playerId == selectedPlayer){
	      return "selected";
	    }
	  },
	  'playerCount': function(){
	    var currentUserId = Meteor.userId();
	    return PlayerList.find({createdBy: currentUserId}).count();
	  },
	  'showSelectedPlayer': function(){
	    var selectedPlayer = Session.get('selectedPlayer');
	    return PlayerList.findOne(selectedPlayer);
	  }
	});

	Template.leaderboard.events({
	  'click .player': function(){
	    var playerId = this._id;
	    Session.set('selectedPlayer', playerId);
	  },
	  'click .increment': function(){
	    var selectedPlayer = Session.get('selectedPlayer');
	    Meteor.call('modifyPlayerScore', selectedPlayer, 5);
	  },
	  'click .decrement': function(){
	    var selectedPlayer = Session.get('selectedPlayer');
	    Meteor.call('modifyPlayerScore', selectedPlayer, -5);
	  },
	  'click .remove': function(){
	    var selectedPlayer = Session.get('selectedPlayer');
	    if(confirm('Are you sure you want to delete the player?')){
	      Meteor.call('removePlayerData', selectedPlayer);
	    }
	  }
	});

	Template.addPlayerForm.events({
	  'submit form': function(event){
	    event.preventDefault();
	    var playerNameVar = event.target.playerName.value;
	    var playerScoreVar = parseInt(event.target.playerScore.value);
	    Meteor.call('insertPlayerData', playerNameVar, playerScoreVar);
	    console.log(event.target.playerName);
	    event.target.reset();
	  }
	});
}

if(Meteor.isServer){
	Meteor.publish('thePlayers', function(){
    var currentUserId = this.userId;
    return PlayerList.find({createdBy: currentUserId});
  });

  Meteor.methods({
    'insertPlayerData': function(playerNameVar, playerScoreVar){
      var currentUserId = Meteor.userId();
      PlayerList.insert({
        name: playerNameVar,
        score: playerScoreVar,
        createdBy: currentUserId
      });
    },
    'removePlayerData': function(selectedPlayer){
      var currentUserId = Meteor.userId();
      PlayerList.remove({_id: selectedPlayer, createdBy: currentUserId});
    },
    'modifyPlayerScore': function(selectedPlayer, scoreValue){
      var currentUserId = Meteor.userId();
      PlayerList.update({_id: selectedPlayer, createdBy: currentUserId}, {$inc: {score: scoreValue} });
    }
  });
}