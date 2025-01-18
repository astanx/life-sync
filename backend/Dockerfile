FROM golang:1.23-alpine AS builder

WORKDIR /user/local/src

COPY ["app/go.mod", "app/go.sum", "./"]

RUN go mod download

COPY app ./

RUN go build -o ./bin/app main.go

FROM alpine AS runner

COPY --from=builder /user/local/src/bin/app /

CMD ["/app"]