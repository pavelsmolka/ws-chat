/**************************
* Application
**************************/
App = Ember.Application.create({
    appName : "WS Demo app",
    ready : function() {

        App.ws = new WebSocket('ws://localhost:8080/');

        App.ws.onopen = function () {
            var initialMessage = App.Message.create({
                from : "Guest",
                text : "Hello, I'm new around here",
                type : "message"
            });
            initialMessage.send();
        };

        App.ws.onerror = function (error) {
            console.log('WebSocket Error ' + error);
        };

        App.ws.onmessage = function (e) {
            console.log(e);
            var messageJson = $.parseJSON(e.data);
            var incomingMessage = App.Message.create(messageJson);
            App.messagesController.pushObject(incomingMessage);
        };
    }
});

/**************************
* Models
**************************/

App.Message = Ember.Object.extend({
    from : null,
    text : null,
    type : "message",
    time : null,

    send : function() {
        var stringMsg = JSON.stringify(this.getProperties("from", "text", "type"));
        App.ws.send(stringMsg);
    }
});



/**************************
* Views
**************************/
App.MessagesListView = Ember.View.extend({
    templateName: 'messages-list'
});

App.AuthorTextField = Em.TextField.extend({
    placeholder : "Guest",
    size : 10
});

App.MessageTextField = Em.TextField.extend(Em.TargetActionSupport, {

    placeholder : "Message text",

    /**
     * Sets the focus when the page is rendered so the user can start typing the message right away.
     */
    didInsertElement: function() {
        this.$().focus();
    },

    insertNewline: function(){
        this.get('parentView').submit();
    }
});

App.SendMessageView = Ember.View.extend({
    templateName : 'send-message',
    newMessage : '',
    from : '',

    init: function(){
        this._super();
        this.set('messages', []); // empty array of messages for each contact
    },

    submit: function(event) {
        var from = this.get('from') || "Guest";
        var message = App.Message.create({
            from : from,
            text : this.get('newMessage')
        });
        message.send();
        this.set('newMessage'); // clean the text field

    }

});



/**************************
* Controllers
**************************/
App.messagesController = Ember.ArrayController.create({

    content:[],

    init: function() {
        var message = App.Message.create({
            from : "System",
            text : "Hello, this is Sample WS & Ember Chat",
        });
        this.pushObject(message);
    }

});

/**************************
 * App Initialization
 **************************/
$(function() {
    App.initialize();
});