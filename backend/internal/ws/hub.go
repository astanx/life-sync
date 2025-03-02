package ws

import (
	"lifeSync/internal/models"
	"sync"

	gorilla "github.com/gorilla/websocket"
)

type Client struct {
	UserID uint
	Conn   *gorilla.Conn
	Send   chan models.Message
	ChatID uint
}

type Hub struct {
	mu         sync.RWMutex
	Clients    map[uint]map[*Client]bool
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan models.Message
}

func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[uint]map[*Client]bool),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan models.Message),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			if h.Clients[client.ChatID] == nil {
				h.Clients[client.ChatID] = make(map[*Client]bool)
			}
			h.Clients[client.ChatID][client] = true
			h.mu.Unlock()

		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.Clients[client.ChatID][client]; ok {
				delete(h.Clients[client.ChatID], client)
				close(client.Send)
			}
			h.mu.Unlock()

		case message := <-h.Broadcast:
			h.mu.RLock()
			clients := h.Clients[message.ChatID]
			for client := range clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}
