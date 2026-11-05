FROM mcr.microsoft.com/dotnet/sdk:10.0.403-noble@sha256:de4fe90a98845d75910b9769662465c84de1a934665c431279d1382b2bddc02b AS build
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_ROLL_FORWARD=Major \
    DACFX_TELEMETRY_OPTOUT=1 \
    NUGET_PACKAGES=/opt/nuget/packages
WORKDIR /workspace
COPY global.json NuGet.Config ./
COPY .config/ .config/
COPY GestorFertilizantes.Database/GestorFertilizantes.Database.sqlproj GestorFertilizantes.Database/packages.lock.json GestorFertilizantes.Database/
COPY tests/GestorFertilizantes.Database.Tests/GestorFertilizantes.Database.Tests.csproj tests/GestorFertilizantes.Database.Tests/packages.lock.json tests/GestorFertilizantes.Database.Tests/
COPY tools/GestorFertilizantes.Database.Admin/GestorFertilizantes.Database.Admin.csproj tools/GestorFertilizantes.Database.Admin/packages.lock.json tools/GestorFertilizantes.Database.Admin/
RUN dotnet tool restore \
    && dotnet restore GestorFertilizantes.Database/GestorFertilizantes.Database.sqlproj --locked-mode \
    && dotnet restore tests/GestorFertilizantes.Database.Tests/GestorFertilizantes.Database.Tests.csproj --locked-mode \
    && dotnet restore tools/GestorFertilizantes.Database.Admin/GestorFertilizantes.Database.Admin.csproj --locked-mode
COPY GestorFertilizantes.Database/ GestorFertilizantes.Database/
COPY tests/ tests/
COPY tools/ tools/
COPY Profiles/ Profiles/
RUN dotnet build GestorFertilizantes.Database/GestorFertilizantes.Database.sqlproj --configuration Release --no-restore \
    && dotnet build tests/GestorFertilizantes.Database.Tests/GestorFertilizantes.Database.Tests.csproj --configuration Release --no-restore \
    && dotnet publish tools/GestorFertilizantes.Database.Admin/GestorFertilizantes.Database.Admin.csproj --configuration Release --no-restore --no-self-contained --output /workspace/admin

# Test-only image; never used as the SQL Server or application runtime.
FROM build AS verify
ENTRYPOINT ["dotnet", "tests/GestorFertilizantes.Database.Tests/bin/Release/net10.0/GestorFertilizantes.Database.Tests.dll"]

# One-shot deployer. No SDK, source catalogues or database files in this image.
FROM mcr.microsoft.com/dotnet/runtime:10.0.14-noble@sha256:a3f9f81954b9c810af2ed18849716c8dc74a4707bd0907fdbd69be81554c0f30 AS deploy
ENV DOTNET_ROLL_FORWARD=Major \
    DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DACFX_TELEMETRY_OPTOUT=1
WORKDIR /app
COPY --from=build /workspace/GestorFertilizantes.Database/bin/Release/*.dacpac /app/
COPY --from=build /workspace/admin/ /app/admin/
COPY --from=build /opt/nuget/packages/microsoft.sqlpackage/170.5.96/tools/net8.0/any/ /app/sqlpackage/
COPY Profiles/Portable.publish.xml /app/Portable.publish.xml
COPY docker/deploy.sh /app/deploy.sh
USER app
ENTRYPOINT ["/bin/bash", "/app/deploy.sh"]
