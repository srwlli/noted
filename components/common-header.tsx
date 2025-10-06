import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuOptionCustomStyle } from 'react-native-popup-menu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { router } from 'expo-router';
import { foldersService, Folder } from '@/services/folders';

interface CommonHeaderProps {
  onNewNote?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onFolderSelect?: (folderId: string | null) => void;
  onNewFolder?: () => void;
  onRenameFolder?: (folder: Folder) => void;
  onDeleteFolder?: (folderId: string) => void;
  selectedFolderId?: string | null;
  folderRefreshTrigger?: number;
}

export function CommonHeader({ onNewNote, onRefresh, refreshing, onFolderSelect, onNewFolder, onRenameFolder, onDeleteFolder, selectedFolderId, folderRefreshTrigger = 0 }: CommonHeaderProps) {
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

  useEffect(() => {
    if (onFolderSelect) {
      loadFolders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderRefreshTrigger]);

  const loadFolders = async () => {
    setLoadingFolders(true);
    try {
      const data = await foldersService.getFolders();
      setFolders(data);
    } catch (err) {
      console.error('Failed to load folders:', err);
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleNewNote = () => {
    if (onNewNote) {
      onNewNote();
    } else {
      router.push('/note-editor/new');
    }
  };

  const handleFolderSelect = (folderId: string | null) => {
    onFolderSelect?.(folderId);
  };

  const handleNewFolder = () => {
    onNewFolder?.();
  };

  return (
    <View style={[
      styles.header,
      {
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
        // Use CSS safe area on web, native insets on mobile
        paddingTop: isWeb ? 'calc(env(safe-area-inset-top, 0px) + 12px)' : insets.top + 12,
        // Add horizontal safe areas for web
        ...(isWeb && {
          paddingLeft: 'max(env(safe-area-inset-left, 0px), 16px)',
          paddingRight: 'max(env(safe-area-inset-right, 0px), 16px)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        })
      }
    ]}>
      <Text style={[styles.branding, { color: colors.text }]}>noted</Text>
      <View style={styles.buttonContainer}>
        {onRefresh && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: refreshing ? 0.6 : 1
              }
            ]}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>⟳</Text>
          </TouchableOpacity>
        )}
        {onFolderSelect && (
          <Menu>
            <MenuTrigger customStyles={{ triggerWrapper: styles.actionButton }}>
              <View style={[
                styles.actionButton,
                { backgroundColor: colors.surface, borderColor: colors.border }
              ]}>
                <MaterialIcons name="folder" size={16} color={colors.text} />
              </View>
            </MenuTrigger>
            <MenuOptions customStyles={{
              optionsContainer: {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 8,
                minWidth: 180,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }
            }}>
              <MenuOption
                onSelect={() => handleFolderSelect(null)}
                customStyles={{ optionWrapper: styles.menuItem }}
              >
                <MaterialIcons name="folder-open" size={20} color={colors.text} />
                <Text style={[styles.menuText, { color: colors.text, fontWeight: selectedFolderId === null ? '600' : '400' }]}>
                  All Notes
                </Text>
              </MenuOption>

              <MenuOption
                onSelect={() => handleFolderSelect('unfiled')}
                customStyles={{ optionWrapper: styles.menuItem }}
              >
                <MaterialIcons name="folder-off" size={20} color={colors.text} />
                <Text style={[styles.menuText, { color: colors.text, fontWeight: selectedFolderId === 'unfiled' ? '600' : '400' }]}>
                  Unfiled
                </Text>
              </MenuOption>

              {folders.length > 0 && (
                <View style={[styles.divider, { borderBottomColor: colors.border }]} />
              )}

              {folders.map((folder) => (
                <View key={folder.id} style={styles.folderRow}>
                  <TouchableOpacity
                    style={styles.folderSelectArea}
                    onPress={() => handleFolderSelect(folder.id)}
                  >
                    <MaterialIcons name="folder" size={20} color={colors.text} />
                    <Text style={[styles.menuText, { color: colors.text, fontWeight: selectedFolderId === folder.id ? '600' : '400' }]}>
                      {folder.name}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.folderMoreButton}
                    onPress={() => onRenameFolder?.(folder)}
                  >
                    <MaterialIcons name="more-vert" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={[styles.divider, { borderBottomColor: colors.border }]} />

              <MenuOption
                onSelect={handleNewFolder}
                customStyles={{ optionWrapper: styles.menuItem }}
              >
                <MaterialIcons name="create-new-folder" size={20} color={colors.tint} />
                <Text style={[styles.menuText, { color: colors.tint }]}>New Folder</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        )}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleNewNote}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  branding: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 4,
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  folderSelectArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 12,
    flex: 1,
  },
  folderMoreButton: {
    padding: 8,
  },
});