FROM mcr.microsoft.com/dotnet/sdk:9.0.319-bookworm-slim@sha256:2f5eb32870b4c0074a3d5b5191a03553bcab7b74463a76a7c0a5f3ef65c90fe5 AS build
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_ROLL_FORWARD=Major \
    DACFX_TELEMETRY_OPTOUT=1 \
    NUGET_PACKAGES=/opt/nuget/packages
WORKDIR /workspace
COPY global.json NuGet.Config ./
COPY .config/ .config/
COPY GestorFertilizantes.Database/GestorFertilizantes.Database.sqlproj GestorFertilizantes.Database/packages.lock.json GestorFertilizantes.Database/
COPY tests/GestorFertilizantes.Database.Tests/GestorFertilizantes.Database.Tests.csproj tests/GestorFertilizantes.Database.Tests/packages.lock.json tests/GestorFertilizantes.Database.Tests/
RUN dotnet tool restore \
    && dotnet restore GestorFertilizantes.Database/GestorFertilizantes.Database.sqlproj --locked-mode \
    && dotnet restore tests/GestorFertilizantes.Database.Tests/GestorFertilizantes.Database.Tests.csproj --locked-mode
COPY GestorFertilizantes.Database/ GestorFertilizantes.Database/
COPY tests/ tests/
COPY Profiles/ Profiles/
RUN dotnet build GestorFertilizantes.Database/GestorFertilizantes.Database.sqlproj --configuration Release --no-restore \
    && dotnet build tests/GestorFertilizantes.Database.Tests/GestorFertilizantes.Database.Tests.csproj --configuration Release --no-restore

# Test-only image; never used as the SQL Server or application runtime.
FROM build AS verify
ENTRYPOINT ["dotnet", "tests/GestorFertilizantes.Database.Tests/bin/Release/net9.0/GestorFertilizantes.Database.Tests.dll"]

# One-shot deployer. No SDK, source catalogues or database files in this image.
FROM mcr.microsoft.com/dotnet/runtime:9.0.21-bookworm-slim@sha256:f0498f092ee240bb91f802b157054dc42c98d6fd6a853ba17e76965c555a9262 AS deploy
ENV DOTNET_ROLL_FORWARD=Major \
    DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DACFX_TELEMETRY_OPTOUT=1
WORKDIR /app
COPY --from=build /workspace/GestorFertilizantes.Database/bin/Release/*.dacpac /app/
COPY --from=build /opt/nuget/packages/microsoft.sqlpackage/170.5.96/tools/net8.0/any/ /app/sqlpackage/
COPY Profiles/Portable.publish.xml /app/Portable.publish.xml
COPY docker/deploy.sh /app/deploy.sh
USER app
ENTRYPOINT ["/bin/bash", "/app/deploy.sh"]
