import {
  Transport,
  NextBox,
  StorageApi,
  StorageElement,
  ResponseItem,
  StorageRoot,
  OrderDirection,
} from 'next-box';

import {
  getErrorMessage,
  IConnection,
  ICreateNode,
  ICreateNodeOptions,
  IGetListOptions,
  IReadNodeOptions,
  IUpdateNode,
  IUpdateNodeOptions,
  notifications,
  pathCorrector,
  shouldThrowError,
} from '../index';

class NextboxService {
  public app = new NextBox();
  public api = new StorageApi();
  private saveIsBlocked = false;

  /**
   * Creates a new node (file or directory) in the storage
   * @param props - Node creation properties including path, name, and type
   * @param options - Optional configuration with force flag (useful for handling file existence error)
   * @returns Promise resolving to the created StorageElement
   * @throws Error if creation fails or save is blocked
   */
  public async createNode(
    props: ICreateNode,
    options: ICreateNodeOptions = {},
  ): Promise<StorageElement> {
    const { path, name, type } = props;
    const { force } = options;
    const fullPath = `${path}/${name}`.replace(/\/+/g, '/');

    if (!force) {
      try {
        const infoResponse = await this.api.info(fullPath);
        return infoResponse;
      } catch (error: unknown) {
        console.error('NEXTBOX.createNode.info:', error);
        if (shouldThrowError(error as Response)) {
          this.saveIsBlocked = true;
          Transport.toast({
            ...notifications.API_DOWNLOAD_ERROR,
            message: getErrorMessage(error),
          });
        }
      }
    }

    try {
      if (this.saveIsBlocked) {
        Transport.toast(notifications.SAVE_IS_BLOCKED_ERROR);
        throw Error(notifications.SAVE_IS_BLOCKED_ERROR.title);
      }
      const normalizedPath = pathCorrector(path);
      const createResponse = await this.api.create(name, normalizedPath, type);
      return createResponse.row;
    } catch (error) {
      console.error('NEXTBOX.createNode.create:', error);
      if (shouldThrowError(error as Response)) {
        Transport.toast({
          ...notifications.API_REPLACE_ERROR,
          message: getErrorMessage(error),
        });
      }
      throw error;
    }
  }

  /**
   * Reads content from a node in the storage
   * @template T - Type of the returned data
   * @param fullPath - Full path to the node to read
   * @param options - Optional configuration for reading (JSON parsing, path normalization)
   * @returns Promise resolving to the node content of type T
   * @throws Error if reading fails or node doesn't exist
   */
  public async readNode<T = unknown>(
    fullPath: string,
    options: IReadNodeOptions = {},
  ): Promise<T> {
    const { readAsJson, normalizePath } = options;
    try {
      const response = await this.api.download(
        normalizePath ? pathCorrector(fullPath) : fullPath,
      );
      if (shouldThrowError(response)) {
        const errorText = await response.text();
        throw Error(errorText);
      }
      const data = readAsJson ? await response.json() : await response.text();
      return data;
    } catch (error) {
      console.error('NEXTBOX.readNode:', error);
      if (!(error as Error).message.includes('Unexpected end of JSON input')) {
        this.saveIsBlocked = true;
        Transport.toast({
          ...notifications.API_DOWNLOAD_ERROR,
          message: getErrorMessage(error),
        });
      }
      throw error;
    }
  }

  /**
   * Updates content of an existing node in the storage
   * @param props - Update properties including full path and new data
   * @param options - Optional configuration for writing (JSON serialization, path normalization)
   * @returns Promise resolving to the update response with StorageElement
   * @throws Error if update fails or save is blocked
   */
  public async updateNode(
    props: IUpdateNode,
    options: IUpdateNodeOptions = {},
  ): Promise<ResponseItem<StorageElement>> {
    if (this.saveIsBlocked) {
      Transport.toast(notifications.SAVE_IS_BLOCKED_ERROR);
      throw Error(notifications.SAVE_IS_BLOCKED_ERROR.title);
    }

    const { fullPath, data } = props;
    const { writeAsJSON, normalizePath } = options;
    try {
      const dataToWrite = writeAsJSON ? JSON.stringify(data) : data;
      const response = await this.api.replace(
        dataToWrite,
        normalizePath ? pathCorrector(fullPath) : fullPath,
      );
      return response;
    } catch (error) {
      console.error('NEXTBOX.updateNode:', error);
      if (shouldThrowError(error as Response)) {
        Transport.toast({
          ...notifications.API_REPLACE_ERROR,
          message: getErrorMessage(error),
        });
      }
      throw error;
    }
  }

  /**
   * Deletes a node from the storage
   * @param fullPath - Full path to the node to delete
   * @returns Promise that resolves when deletion is complete
   * @throws Error if deletion fails or save is blocked
   */
  public async deleteNode(fullPath: string): Promise<void> {
    if (this.saveIsBlocked) {
      Transport.toast(notifications.SAVE_IS_BLOCKED_ERROR);
      throw Error(notifications.SAVE_IS_BLOCKED_ERROR.title);
    }

    const queryParams = new URLSearchParams({
      path: fullPath,
    });

    if (this.app.state?.storage.root === StorageRoot.divide) {
      queryParams.set('divide_id', this.app.state.storage.rootID.toString());
    }

    try {
      await fetch(
        `${this.app.state?.api.host}${
          this.app.state?.api.prefix
        }/storage/element?${queryParams.toString()}`,
        {
          method: 'DELETE',
        },
      );
    } catch (error) {
      console.error('NEXTBOX.deleteNode:', error);
      if (shouldThrowError(error as Response)) {
        Transport.toast({
          ...notifications.API_DELETE_ERROR,
          message: getErrorMessage(error),
        });
      }
      throw error;
    }
  }

  /**
   * Copies a node from one location to another in the storage
   * @param fromFullPath - Source path of the node to copy
   * @param toFullPath - Destination path for the copied node
   * @returns Promise resolving to the copied StorageElement
   * @throws Error if copy operation fails or save is blocked
   */
  public async copyNode(
    fromFullPath: string,
    toFullPath: string,
  ): Promise<StorageElement> {
    if (this.saveIsBlocked) {
      Transport.toast(notifications.SAVE_IS_BLOCKED_ERROR);
      throw Error(notifications.SAVE_IS_BLOCKED_ERROR.title);
    }

    let body = JSON.stringify({
      overwrite: false,
      paths: [
        {
          from_path: fromFullPath,
          to_path: toFullPath,
        },
      ],
    });
    if (this.app.state?.storage.root === StorageRoot.divide) {
      body = JSON.stringify({
        overwrite: false,
        paths: [
          {
            from_path: fromFullPath,
            to_path: toFullPath,
          },
        ],
        from_divide_id: Number(this.app.state.storage.rootID),
        to_divide_id: Number(this.app.state.storage.rootID),
      });
    }
    try {
      const response = await fetch(
        `${this.app.state?.api.host}${this.app.state?.api.prefix}/storage/element/copy`,
        {
          headers: {
            ...this.app.state?.api.headers,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: body,
        },
      );
      const data = await response.json();
      if (data.rows) {
        return data.rows[0] as StorageElement;
      } else {
        const errorText = await response.text();
        throw Error(errorText);
      }
    } catch (error) {
      console.error('NEXTBOX.copyNode:', error);
      if (shouldThrowError(error as Response)) {
        Transport.toast({
          ...notifications.API_DELETE_ERROR,
          message: getErrorMessage(error),
        });
      }
      throw error;
    }
  }

  /**
   * Retrieves a list of storage elements from a specified path
   * @param path - Path to list contents from
   * @param options - Configuration options for listing (limit, filtering, sorting, search, e.t.c)
   * @returns Promise resolving to an array of StorageElement objects
   * @throws Error if listing fails or path is inaccessible
   */
  public async getList(
    path: string,
    options: IGetListOptions,
  ): Promise<StorageElement[]> {
    const {
      limit = 10000,
      with_meta = false,
      filter = null,
      order_by = 'name',
      order_direction = OrderDirection.ASC,
      search = '',
      exclude = null,
      file_name_ext = [],
    } = options;
    try {
      const normalizedPath = pathCorrector(path);
      const result = await this.api.list({
        path: normalizedPath,
        with_meta,
        limit,
        order_by,
        order_direction,
        search,
        file_name_ext,
      });
      let data = result.rows || [];
      if (filter || exclude) {
        data = data.filter(
          (item) => item.type === filter && !exclude?.includes(item.name),
        );
      }
      return data as StorageElement[];
    } catch (error) {
      console.error('NEXTBOX.getList:', error);
      if (shouldThrowError(error as Response)) {
        this.saveIsBlocked = true;
        Transport.toast({
          ...notifications.API_DELETE_ERROR,
          message: getErrorMessage(error),
        });
      }
      throw error;
    }
  }

  /**
   * Retrieves available connections from the API
   * @returns Promise resolving to an array of IConnection objects or null if no connections found
   * @throws Error if connection retrieval fails
   */
  public async getConnections(): Promise<IConnection[] | null> {
    try {
      const myConnectionsRequestPath = `${this.app.state?.api.host}${this.app.state?.api.prefix}/connections?limit=100&offset=0&type=http_proxy_connection`;
      const sharedConnectionRequestPath = `${myConnectionsRequestPath}&is_divided=true`;

      const myConnectionsResponse = await fetch(myConnectionsRequestPath);
      const sharedConnectionsResponse = await fetch(
        sharedConnectionRequestPath,
      );

      const myConnections = await myConnectionsResponse.json();
      const sharedConnections = await sharedConnectionsResponse.json();

      const connections = (await myConnections).rows.concat(
        (await sharedConnections).rows,
      );

      if (connections?.length === 0) {
        return null;
      }

      return connections;
    } catch (error) {
      console.error('NEXTBOX.getConnections:', error);
      Transport.toast({
        ...notifications.API_DOWNLOAD_ERROR,
        message: (error as Error).message,
      });
      throw error;
    }
  }
}

export const nextbox = new NextboxService();
