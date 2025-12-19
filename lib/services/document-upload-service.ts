import { 
  Document, 
  DocumentMetadata, 
  FileValidationResult, 
  UploadResult, 
  UploadProgress,
  UploadConfig,
  formatFileSize,
  getMimeTypeCategory,
  isImageFile,
  isPdfFile
} from '@/types/documents';

export class DocumentUploadService {
  private static readonly DEFAULT_CONFIG: UploadConfig = {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // PDF
      'application/pdf',
      // Documents
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Texte
      'text/plain', 'text/csv', 'text/html', 'text/xml',
      // Archives
      'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
      // Audio
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      // Vidéo
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv'
    ],
    maxFilesPerUpload: 10,
    enableVirusScan: false, // À implémenter avec un service externe
    enablePreview: true,
    generateThumbnails: true
  };

  /**
   * Valide un fichier selon les règles de sécurité
   */
  static validateFile(file: File, config: UploadConfig = this.DEFAULT_CONFIG): FileValidationResult {
    const warnings: string[] = [];
    
    // Vérification de la taille
    if (file.size > config.maxFileSize) {
      return {
        valid: false,
        error: `Fichier trop volumineux. Taille maximale: ${formatFileSize(config.maxFileSize)}`
      };
    }

    // Vérification du type MIME
    if (!config.allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Type de fichier non autorisé: ${file.type}`
      };
    }

    // Vérification du nom de fichier
    const fileName = file.name;
    if (fileName.length > 255) {
      warnings.push('Nom de fichier très long, peut être tronqué');
    }

    // Vérification des caractères dangereux dans le nom
    const dangerousChars = /[<>:"/\\|?*]/;
    if (dangerousChars.test(fileName)) {
      return {
        valid: false,
        error: 'Le nom de fichier contient des caractères interdits'
      };
    }

    // Avertissements pour certains types de fichiers
    if (file.type.includes('zip') || file.type.includes('rar')) {
      warnings.push('Les fichiers d\'archive peuvent contenir des fichiers malveillants');
    }

    if (file.type.includes('javascript') || file.type.includes('executable')) {
      warnings.push('Ce type de fichier nécessite une attention particulière');
    }

    // Vérification du contenu pour les images
    if (isImageFile(file.type) && config.generateThumbnails) {
      warnings.push('Les thumbnails seront générés automatiquement');
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Génère un nom de fichier unique et sécurisé
   */
  static generateUniqueFileName(originalName: string, userId?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop() || '';
    const baseName = originalName.replace(/\.[^/.]+$/, ''); // Retire l'extension
    
    // Nettoie le nom de base
    const cleanBaseName = baseName
      .replace(/[^a-zA-Z0-9\s-_]/g, '_') // Remplace les caractères spéciaux par _
      .replace(/\s+/g, '_') // Remplace les espaces par _
      .substring(0, 50); // Limite la longueur
    
    const fileName = `${timestamp}_${randomString}_${cleanBaseName}`;
    
    return extension ? `${fileName}.${extension}` : fileName;
  }

  /**
   * Calcule le checksum SHA-256 d'un fichier
   */
  static async calculateChecksum(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Génère un thumbnail pour une image (à implémenter avec une librairie comme Sharp)
   */
  static async generateThumbnail(imageFile: File): Promise<File> {
    // Implémentation placeholder - dans un vrai projet, vous utiliseriez Sharp ou ImageMagick
    // pour générer des thumbnails côté serveur
    
    if (!isImageFile(imageFile.type)) {
      throw new Error('Seules les images peuvent avoir des thumbnails générés');
    }

    // Simulation d'un thumbnail (retourne l'image originale pour l'instant)
    return imageFile;
  }

  /**
   * Compresse un fichier si nécessaire
   */
  static async compressIfNeeded(file: File): Promise<File> {
    // Pour les images, compression avec Sharp
    if (isImageFile(file.type)) {
      // Implémentation placeholder - dans un vrai projet, compression automatique
      return file;
    }

    // Pour les PDFs, compression si possible
    if (isPdfFile(file.type)) {
      // Implémentation placeholder
      return file;
    }

    // Pas de compression pour les autres types
    return file;
  }

  /**
   * Sauvegarde un fichier (simulation - dans un vrai projet, utiliser AWS S3, Google Cloud, etc.)
   */
  static async saveFile(file: File, fileName: string, userId: string): Promise<{ filePath: string; fileSize: number }> {
    // Dans une implémentation réelle, vous uploderiez vers un service de stockage cloud
    // const storage = new AWS.S3();
    // const result = await storage.upload({...}).promise();
    
    const filePath = `/uploads/documents/${userId}/${fileName}`;
    
    // Simulation de sauvegarde locale
    console.log(`Fichier sauvegardé: ${filePath}`);
    
    return {
      filePath,
      fileSize: file.size
    };
  }

  /**
   * Effectue une scan antivirus (à implémenter avec un service comme VirusTotal)
   */
  static async scanForViruses(file: File): Promise<boolean> {
    if (!this.DEFAULT_CONFIG.enableVirusScan) {
      return true; // Scan désactivé
    }

    // Implémentation placeholder
    // const virusTotal = new VirusTotalAPI(process.env.VIRUS_TOTAL_API_KEY);
    // const result = await virusTotal.scanFile(file);
    // return result.isClean();

    return true;
  }

  /**
   * Traite un fichier complet : validation, compression, checksum, sauvegarde
   */
  static async processFile(
    file: File, 
    metadata: DocumentMetadata, 
    userId: string,
    companyId?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      onProgress?.({
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      });

      // 1. Validation
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          fileName: file.name,
          error: validation.error
        };
      }

      onProgress?.({
        fileName: file.name,
        progress: 20,
        status: 'uploading'
      });

      // 2. Scan antivirus
      const isClean = await this.scanForViruses(file);
      if (!isClean) {
        return {
          success: false,
          fileName: file.name,
          error: 'Fichier suspecté d\'être malveillant'
        };
      }

      onProgress?.({
        fileName: file.name,
        progress: 40,
        status: 'processing'
      });

      // 3. Compression si nécessaire
      const processedFile = await this.compressIfNeeded(file);

      // 4. Génération du checksum
      const checksum = await this.calculateChecksum(processedFile);

      onProgress?.({
        fileName: file.name,
        progress: 60,
        status: 'processing'
      });

      // 5. Génération du nom unique
      const uniqueFileName = this.generateUniqueFileName(processedFile.name, userId);

      // 6. Sauvegarde
      const { filePath, fileSize } = await this.saveFile(processedFile, uniqueFileName, userId);

      onProgress?.({
        fileName: file.name,
        progress: 80,
        status: 'processing'
      });

      // 7. Génération du thumbnail si nécessaire
      let thumbnailPath: string | undefined;
      if (isImageFile(processedFile.type) && this.DEFAULT_CONFIG.generateThumbnails) {
        const thumbnail = await this.generateThumbnail(processedFile);
        const thumbnailName = `thumb_${uniqueFileName}`;
        thumbnailPath = await this.saveFile(thumbnail, thumbnailName, userId).then(r => r.filePath);
      }

      onProgress?.({
        fileName: file.name,
        progress: 100,
        status: 'completed'
      });

      // 8. Retourne les métadonnées du fichier traité
      return {
        success: true,
        fileName: file.name,
        progress: {
          fileName: file.name,
          progress: 100,
          status: 'completed'
        },
        document: {
          id: '', // Sera rempli par l'API après création en base
          fileName: processedFile.name,
          fileSize: fileSize,
          filePath,
          mimeType: processedFile.type,
          userId,
          companyId,
          attachedTo: metadata.attachedTo,
          attachedId: metadata.attachedId,
          version: 1,
          isPublic: metadata.isPublic || false,
          labels: metadata.labels || [],
          description: metadata.description,
          checksum,
          autoDelete: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { id: userId, name: '', email: '' },
          company: companyId ? { id: companyId, name: '' } : undefined
        } as Document
      };

    } catch (error) {
      onProgress?.({
        fileName: file.name,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });

      return {
        success: false,
        fileName: file.name,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Traite plusieurs fichiers en parallèle
   */
  static async processMultipleFiles(
    files: File[],
    metadata: DocumentMetadata,
    userId: string,
    companyId?: string,
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<UploadResult[]> {
    if (files.length > this.DEFAULT_CONFIG.maxFilesPerUpload) {
      throw new Error(`Trop de fichiers. Maximum: ${this.DEFAULT_CONFIG.maxFilesPerUpload}`);
    }

    const results: UploadResult[] = [];
    const progressMap = new Map<string, UploadProgress>();

    // Fonction de mise à jour du progrès global
    const updateProgress = () => {
      const progressArray = Array.from(progressMap.values());
      onProgress?.(progressArray);
    };

    // Traitement en parallèle
    const processPromises = files.map(async (file) => {
      const result = await this.processFile(
        file,
        metadata,
        userId,
        companyId,
        (progress) => {
          progressMap.set(file.name, progress);
          updateProgress();
        }
      );
      return result;
    });

    return await Promise.all(processPromises);
  }

  /**
   * Valide et nettoie les métadonnées
   */
  static sanitizeMetadata(metadata: Partial<DocumentMetadata>): DocumentMetadata {
    return {
      fileName: metadata.fileName || '',
      mimeType: metadata.mimeType || '',
      attachedTo: metadata.attachedTo || undefined,
      attachedId: metadata.attachedId || undefined,
      labels: metadata.labels?.map(label => label.trim()).filter(Boolean) || [],
      description: metadata.description?.trim() || undefined,
      isPublic: metadata.isPublic || false,
      companyId: metadata.companyId || undefined
    };
  }
}

export default DocumentUploadService;