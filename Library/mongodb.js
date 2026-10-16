import Node from "#Node";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = Node.Path.dirname(__filename);

export const load = async () => {
  try {
    console.info('Loading... DB Connection');

    if (process.env.NODE_ENV === Node.DEVELOPMENT_ENV) {
      Node.DB_URI = process.env.MONGO_URL;
      console.info('MongoDB Uri: ' + Node.DB_URI)
    }

    if (process.env.NODE_ENV !== Node.DEVELOPMENT_ENV) {
      if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
        Node.DB_URI = 'mongodb://' + process.env.MONGODB_USER + ':' + process.env.MONGODB_PASSWORD + '@' + process.env.MONGODB_HOST + ':' + process.env.MONGODB_PORT + '/' + process.env.MONGODB_DATABASE + '?authSource=admin';
      } else {
        Node.DB_URI = 'mongodb://' + process.env.MONGODB_HOST + ':' + process.env.MONGODB_PORT + '/' + process.env.MONGODB_DATABASE + '?authSource=admin';
        console.info('MonogDB Uri: ' + Node.DB_URI)
      }
    }
    let opt = { minPoolSize: 50, maxPoolSize: 200, }
    await Node.Mongoose.set("strictPopulate", false)
    await Node.Mongoose.connect(Node.DB_URI, opt);
    return true;
  } catch (error) {
    console.log('Error... DB Connection', error);
    return false;
  };
};

export const mongoBackUp = async () => {
  try {
    const date = new Date();

    const backupDir = `dump-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    Node.Fs.mkdirSync(`./MongoDump/${backupDir}`, { recursive: true });

    const backupDirPath = Node.Path.join(__dirname, '../MongoDump', backupDir);

    let backupProcess = child_process.spawn('mongodump', [
      '--uri', Node.DB_URI,
      '--out', backupDirPath,
      '--forceTableScan'
    ]);

    backupProcess.on('exit', async (code, signal) => {
      if (code) {
        console.log('Backup process exited with code ', code);
      } else if (signal) {
        console.error('Backup process was killed with singal ', signal);
      } else {
        console.log('Successfully backedup the database');
        const olderDate = new Date(new Date().setDate(new Date().getDate() - 3));

        const olderBackupDir = `dump-${olderDate.getFullYear()}-${String(olderDate.getMonth() + 1).padStart(2, '0')}-${String(olderDate.getDate()).padStart(2, '0')}`;
        const olderBackupDirPath = Node.Path.join(__dirname, '../MongoDump', olderBackupDir);

        Node.Fs.rm(olderBackupDirPath, { recursive: true, force: true }, err => {
          if (err) console.log(err);
          console.log(`${olderBackupDirPath} is deleted!`);
        });
      };
    });
  } catch (error) {
    console.error("Error... mongoBackup", error);
  }
};
