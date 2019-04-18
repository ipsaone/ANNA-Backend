# VARIABLES
OUTPUT_FOLDER="/home/vagrant"
OUTPUT_FILE="save1.tgz"
MYSQL_USERNAME="root"
MYSQL_PWD="secret"
TMP_FOLDER="/tmp"
MYSQL_CONF_FOLDER="/etc/mysql"
NGINX_CONF_FOLDER="/etc/nginx"
REDIS_CONF_FOLDER="/etc/redis"
ANNA_FOLDER="/home/vagrant/ANNA-Backend"
LOG="./backup_log"

# CREATE TEMP FOLDER
echo "creating temp folder"
TMP_OUTPUT=$TMP_FOLDER/save_$(date +%m-%d-%Y)
mkdir $TMP_OUTPUT

# COPY MYSQL DATABASE
echo "copying mysql database"
mysqldump -u$MYSQL_USERNAME -p$MYSQL_PWD ipsaone  > $TMP_OUTPUT/database.sql
# COPY MYSQL CONFIG
echo "copying mysql config"
cp -Rf $MYSQL_CONF_FOLDER $TMP_OUTPUT/mysql_cfg
# COPY NGINX CONFIG
echo "copying nginx config"
cp -Rf $NGINX_CONF_FOLDER $TMP_OUTPUT/nginx_cfg
# COPY REDIS CONFIG
echo "copying redis config"
cp -Rf $REDIS_CONF_FOLDER $TMP_OUTPUT/redis_cfg
# COPY UPLOADS (STORAGE)
echo "copying ANNA folder"
cp -Rf $ANNA_FOLDER $TMP_OUTPUT/ANNA

# ZIP ALL
echo "zipping everything"
tar -zcvf $OUTPUT_FOLDER/$OUTPUT_FILE $TMP_OUTPUT >> $LOG

# DELETE TEMP FOLDER IF ALL WENT WELL 
echo "deleting temp folder"
rm -rf $TMP_OUTPUT
