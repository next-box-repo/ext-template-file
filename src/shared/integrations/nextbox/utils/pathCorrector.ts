import { ExtensionType, StorageRoot } from 'next-box';

import { nextbox } from '../service';

export function pathCorrector(path: string): string {
  if (!nextbox.app.state) throw new Error('Nextbox initialization error');
  const root: StorageRoot = nextbox.app.state.storage.root;
  const extenstionType: ExtensionType = nextbox.app.state.extenstion.type;

  if (extenstionType !== ExtensionType.WorkDir) {
    return path;
  }
  switch (root) {
    case StorageRoot.my: {
      const rootPath = nextbox.app.state.storage.path;
      const normalizedPath = path.replace(rootPath, '');
      return normalizedPath;
    }
    case StorageRoot.share:
    case StorageRoot.divide: {
      if (nextbox.app.state.storage.path !== '/') {
        const rootPath = nextbox.app.state.storage.path;
        const normalizedPath = path.replace(rootPath, '');
        return normalizedPath;
      }
      return path;
    }
    default:
      return path;
  }
}
