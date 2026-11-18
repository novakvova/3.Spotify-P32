# Ставимо клод для розробки і тестуємо PowerShell
```
irm https://claude.ai/install.ps1 | iex
Test-Path "$env:USERPROFILE\.local\bin\claude.exe"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\.local\bin", "User")

claude --version

claude

/init

Проаналізуй структуру проєкту, технології,
залежності та основні архітектурні рішення та запиши у spec.md

Додай у CLAUDE.md, додай правила кодування, архітектури та тестування.

/cost

/model

claude --resume 
```


# Робота з dotnet
```
dotnet build
dotnet run
dotnet watch

dotnet tool install --global dotnet-ef
dotnet ef migrations add AddIdentityTabels
dotnet ef database update
```

# Build Project

```
docker build -t test-api .
docker build --no-cache -t test-api .
docker run -d --restart=always --name test-api-container -p 8154:8080 test-api

docker tag test-api:latest novakvova/test-api:latest
docker push novakvova/test-api:latest

```

## nginx options
```
server {
    server_name   test.itstep.click *.test.itstep.click;
    client_max_body_size 200M;
    location / {
       proxy_pass         http://localhost:2454;
       proxy_http_version 1.1;
       proxy_set_header   Upgrade $http_upgrade;
       proxy_set_header   Connection keep-alive;
       proxy_set_header   Host $host;
       proxy_cache_bypass $http_upgrade;
       proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header   X-Forwarded-Proto $scheme;
    }
}

server {
    server_name   test-api.itstep.click *.test-api.itstep.click;
    client_max_body_size 200M;
    location / {
       proxy_pass         http://localhost:8154;
       proxy_http_version 1.1;
       proxy_set_header   Upgrade $http_upgrade;
       proxy_set_header   Connection keep-alive;
       proxy_set_header   Host $host;
       proxy_cache_bypass $http_upgrade;
       proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header   X-Forwarded-Proto $scheme;
    }
}

```