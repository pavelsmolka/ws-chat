require 'rubygems'
require 'json'
require 'em-websocket'

class WsServer

  def start
    EventMachine.run do

      # create a chat_room object. Shared by every connection
      @chat_room = EM::Channel.new

      EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8080) do |ws|

        # fires when we open a connection
        ws.onopen do

          # holds info about the user's chat session.
          nick_name = nil

          # subscribe to the chat_room
          sid = @chat_room.subscribe do |msg|
            ws.send msg.to_json
          end

          # fires when we receive a message on the channel
          ws.onmessage do |msg|

            message = JSON.parse(msg)
            puts "INFO: Message received: " + message.inspect

            case message["type"]
              when "join"
                @chat_room.push({:time => "#{Time.now.strftime("%H:%M:%S")}", :from => "SYSTEM", :text => "#{message["from"]} joined!"})
              when "message"
                @chat_room.push({:time => "#{Time.now.strftime("%H:%M:%S")}", :from => "#{message["from"]}", :text => "#{message["text"]}"}) unless message["from"] == nil
              else
                puts "Unknown message type #{message["type"].inspect}"
            end

          end

          # fires when someone leaves
          ws.onclose do
            @chat_room.unsubscribe(sid)
            @chat_room.push "#{nick_name} has left"
          end

        end
      end

      puts "INFO: Chat server started"
    end

  end
end


WsServer.new.start
