L'installation de l'application Maps se fait via des images Docker, selon la description de déploiement décrite dans le fichier `docker-compose.yml` prévu à cet effet.

### Marche à suivre

1. Mettre en place la [gestion des données OpenStreetMap](https://gitlab.avasad.ch/geos/scripts/-/blob/main/README.md)

2. [Installer le reverse proxy NGINX](https://gitlab.avasad.ch/geos/nginx-server/-/blob/main/README.md)

3. Placer les [fichiers de l'application](https://gitlab.avasad.ch/geos/maps/maps-front), dont le [docker-compose.yml](https://gitlab.avasad.ch/geos/maps/maps-front/-/blob/main/docker-compose.yml), dans le répertoire `/srv/geos/maps-front`

4. Copier le [Dockerfile](https://gitlab.avasad.ch/geos/maps/maps-front/-/blob/main/ops/build/Dockerfile) dans le répertoire `/srv/geos/maps-front` pour construire l'image `maps-front` (ce fichier se trouve dans `/srv/geos/maps-front/ops/build` car il est utilisé par les pipelines GitLab)

   ```shell
   cd /srv/geos/maps-front
   cp ops/build/Dockerfile .
   docker build --network=host -t maps-front .
   rm -f Dockerfile
   ```

5. Créer les containers Docker et déployer l'application

   ```shell
   cd /srv/geos/maps-front
   docker compose up -d
   ```
