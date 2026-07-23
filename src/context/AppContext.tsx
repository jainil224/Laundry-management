import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, WardrobeItem, LaundryBatch, ActivityLogItem, ClothingCategory } from '../types';
import { 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  db, 
  auth, 
  signInWithGoogle, 
  signUpWithEmail, 
  signInWithEmail, 
  logoutUser 
} from '../lib/firebase';

enum OperationType {
  GET = 'GET',
  LIST = 'LIST',
  WRITE = 'WRITE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

const handleFirestoreError = (error: any, op: OperationType, path: string) => {
  console.warn(`[Firestore ${op}] ${path}:`, error?.message || error);
};

interface AppContextType {
  user: UserProfile | null;
  firebaseUser: any;
  authLoading: boolean;
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
  wardrobe: WardrobeItem[];
  batches: LaundryBatch[];
  activityLogs: ActivityLogItem[];
  categories: ClothingCategory[];
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (e: string, p: string, n: string) => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (data: Omit<UserProfile, 'uid' | 'createdAt' | 'onboardingComplete'>) => Promise<void>;
  addWardrobeItem: (item: { categoryId: string; photoUrl: string; color: string | null; label: string }) => Promise<WardrobeItem>;
  deleteWardrobeItem: (id: string) => Promise<void>;
  updateWardrobeItem: (id: string, updates: Partial<WardrobeItem>) => Promise<void>;
  submitLaundryBatch: (itemIds: string[], notes?: string) => Promise<LaundryBatch>;
  markBatchCollected: (batchId: string) => Promise<void>;
  markClothWashed: (itemId: string) => Promise<void>;
  markClothMissing: (itemId: string) => Promise<void>;
  deleteBatch: (batchId: string) => Promise<void>;
  clearAllBatches: () => Promise<void>;
  resetDemoData: () => void;
  getReadyBatchesCount: () => number;
}

const DEFAULT_CATEGORIES: ClothingCategory[] = [
  { id: 'cat-1', name: 'T-Shirts', icon: '👕', careNote: 'Regular wash' },
  { id: 'cat-2', name: 'Shirts', icon: '👔', careNote: 'Gentle cycle' },
  { id: 'cat-3', name: 'Pants & Jeans', icon: '👖', careNote: 'Wash inside out' },
  { id: 'cat-4', name: 'Shorts', icon: '🩳', careNote: 'Regular wash' },
  { id: 'cat-5', name: 'Undergarments & Socks', icon: '🧦', careNote: 'Warm wash' },
  { id: 'cat-6', name: 'Towels & Bedding', icon: '🧺', careNote: 'Hot wash' },
  { id: 'cat-7', name: 'Jacket', icon: '🧥', careNote: 'Dry clean or gentle wash' },
  { id: 'cat-8', name: 'Blanket', icon: '🛌', careNote: 'Heavy duty wash' },
  { id: 'cat-9', name: 'Pillow Cover', icon: '🛏️', careNote: 'Regular wash' },
  { id: 'cat-10', name: 'Track Pants & Suits', icon: '🏃', careNote: 'Sportswear cycle' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);

  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [batches, setBatches] = useState<LaundryBatch[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);

  // 1. Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      setAuthLoading(true);

      if (fbUser) {
        const userDocRef = doc(db, 'users', fbUser.uid);
        try {
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const userData = userSnap.data() as UserProfile;
            setUser(userData);
            setIsOnboarded(userData.onboardingComplete === true);
          } else {
            // New user registration
            const newUser: UserProfile = {
              uid: fbUser.uid,
              name: fbUser.displayName || 'Hostel Student',
              roomNumber: '',
              floorNumber: '',
              phone: '',
              profilePhotoUrl: fbUser.photoURL || '',
              createdAt: new Date().toISOString(),
              onboardingComplete: false,
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
            setIsOnboarded(false);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}`);
        }
      } else {
        setUser(null);
        setIsOnboarded(false);
        setWardrobe([]);
        setBatches([]);
        setActivityLogs([]);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Realtime Firestore Sync
  useEffect(() => {
    if (!firebaseUser) return;
    const userId = firebaseUser.uid;

    // User Doc Listener
    const unsubUser = onSnapshot(
      doc(db, 'users', userId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setUser(data);
          setIsOnboarded(data.onboardingComplete === true);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      }
    );

    // Wardrobe Listener
    const wardrobeQuery = query(collection(db, 'wardrobe'), where('userId', '==', userId));
    const unsubWardrobe = onSnapshot(
      wardrobeQuery,
      async (snapshot) => {
        const rawItems = snapshot.docs.map((doc) => doc.data() as WardrobeItem);
        const demoLabels = [
          'Navy Blue Linen Shirt',
          'Oversized College Tee',
          'Slim Fit Levi Denim',
          'Hostel Night Hoodie',
          'Bath Towel Large',
        ];

        const realItems: WardrobeItem[] = [];
        for (const item of rawItems) {
          if (item.id.startsWith('w-10') || demoLabels.includes(item.label)) {
            try {
              await deleteDoc(doc(db, 'wardrobe', item.id));
            } catch (e) {
              console.error('Failed to purge demo item:', e);
            }
          } else {
            realItems.push(item);
          }
        }

        realItems.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        setWardrobe(realItems);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'wardrobe');
      }
    );

    // Batches Listener
    const batchesQuery = query(collection(db, 'batches'), where('userId', '==', userId));
    const unsubBatches = onSnapshot(
      batchesQuery,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => doc.data() as LaundryBatch);
        items.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setBatches(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'batches');
      }
    );

    // Logs Listener
    const logsQuery = query(collection(db, 'activityLogs'), where('userId', '==', userId));
    const unsubLogs = onSnapshot(
      logsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => doc.data() as ActivityLogItem);
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivityLogs(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'activityLogs');
      }
    );

    return () => {
      unsubUser();
      unsubWardrobe();
      unsubBatches();
      unsubLogs();
    };
  }, [firebaseUser]);

  const handleSignOutUser = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    if (!firebaseUser) return;
    const path = `users/${firebaseUser.uid}`;
    try {
      const updated = { ...data, uid: firebaseUser.uid };
      await setDoc(doc(db, 'users', firebaseUser.uid), updated, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const completeOnboarding = async (data: Omit<UserProfile, 'uid' | 'createdAt' | 'onboardingComplete'>) => {
    const uid = firebaseUser?.uid;
    if (!uid) return;

    const newUser: UserProfile = {
      ...data,
      uid,
      createdAt: user?.createdAt || new Date().toISOString(),
      onboardingComplete: true,
    };

    const path = `users/${uid}`;
    try {
      await setDoc(doc(db, 'users', uid), newUser, { merge: true });
      setUser(newUser);
      setIsOnboarded(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const addWardrobeItem = async (itemData: { categoryId: string; photoUrl: string; color: string | null; label: string }) => {
    const uid = firebaseUser?.uid || 'guest';
    const itemId = `w-${Date.now()}`;
    const newItem: WardrobeItem = {
      id: itemId,
      userId: uid,
      roomNumber: user?.roomNumber || '207',
      categoryId: itemData.categoryId,
      photoUrl: itemData.photoUrl,
      color: itemData.color || 'Black',
      label: itemData.label,
      addedAt: new Date().toISOString(),
      inWash: false,
    };

    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      userId: uid,
      roomNumber: user?.roomNumber || '207',
      batchId: null,
      type: 'item_added',
      message: `Added "${itemData.label}" to wardrobe`,
      timestamp: new Date().toISOString(),
    };

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'wardrobe', itemId), newItem);
        await setDoc(doc(db, 'activityLogs', newLog.id), newLog);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `wardrobe/${itemId}`);
      }
    } else {
      setWardrobe((prev) => [newItem, ...prev]);
      setActivityLogs((prev) => [newLog, ...prev]);
    }

    return newItem;
  };

  const deleteWardrobeItem = async (itemId: string) => {
    if (firebaseUser) {
      try {
        await deleteDoc(doc(db, 'wardrobe', itemId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `wardrobe/${itemId}`);
      }
    } else {
      setWardrobe((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  const updateWardrobeItem = async (itemId: string, updates: Partial<WardrobeItem>) => {
    if (firebaseUser) {
      try {
        await updateDoc(doc(db, 'wardrobe', itemId), updates);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `wardrobe/${itemId}`);
      }
    } else {
      setWardrobe((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item)));
    }
  };

  const submitLaundryBatch = async (selectedItemIds: string[], notes?: string) => {
    const uid = firebaseUser?.uid || 'guest';
    const roomNum = user?.roomNumber || '207';
    const expected = new Date(Date.now() + 86400000 * 2);
    expected.setHours(17, 0, 0, 0);

    const batchId = `batch-${Date.now()}`;
    const newBatch: LaundryBatch = {
      id: batchId,
      userId: uid,
      roomNumber: roomNum,
      itemIds: selectedItemIds,
      itemCount: selectedItemIds.length,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      expectedCollectionDate: expected.toISOString(),
      collectedAt: null,
      notes: notes || '',
    };

    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      userId: uid,
      roomNumber: roomNum,
      batchId: newBatch.id,
      type: 'submitted',
      message: `${selectedItemIds.length} items submitted for laundry wash`,
      timestamp: new Date().toISOString(),
    };

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'batches', batchId), newBatch);
        await setDoc(doc(db, 'activityLogs', newLog.id), newLog);
        for (const itemId of selectedItemIds) {
          await updateDoc(doc(db, 'wardrobe', itemId), { inWash: true });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `batches/${batchId}`);
      }
    } else {
      setBatches((prev) => [newBatch, ...prev]);
      setWardrobe((prev) =>
        prev.map((item) => (selectedItemIds.includes(item.id) ? { ...item, inWash: true } : item))
      );
      setActivityLogs((prev) => [newLog, ...prev]);
    }

    return newBatch;
  };

  const markBatchCollected = async (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;

    const uid = firebaseUser?.uid || 'guest';
    const now = new Date().toISOString();

    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      userId: uid,
      roomNumber: user?.roomNumber || '207',
      batchId: batch.id,
      type: 'collected',
      message: `Collected ${batch.itemCount} laundry items`,
      timestamp: now,
    };

    if (firebaseUser) {
      try {
        await updateDoc(doc(db, 'batches', batchId), { status: 'collected', collectedAt: now });
        await setDoc(doc(db, 'activityLogs', newLog.id), newLog);
        for (const itemId of batch.itemIds) {
          await updateDoc(doc(db, 'wardrobe', itemId), { inWash: false });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `batches/${batchId}`);
      }
    } else {
      setBatches((prev) =>
        prev.map((b) => (b.id === batchId ? { ...b, status: 'collected', collectedAt: now } : b))
      );
      setWardrobe((prev) =>
        prev.map((item) => (batch.itemIds.includes(item.id) ? { ...item, inWash: false } : item))
      );
      setActivityLogs((prev) => [newLog, ...prev]);
    }
  };

  // 🚀 When clicking "Washed", update batch status to collected & move item into history instantly!
  const markClothWashed = async (itemId: string) => {
    const uid = firebaseUser?.uid || 'guest';
    const roomNum = user?.roomNumber || '207';
    const item = wardrobe.find((i) => i.id === itemId);
    const labelName = item?.label || 'Garment';
    const now = new Date().toISOString();

    // Check if there is an existing active batch containing this item
    const activeBatch = batches.find((b) => b.itemIds.includes(itemId) && b.status !== 'collected');

    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      userId: uid,
      roomNumber: roomNum,
      batchId: activeBatch ? activeBatch.id : null,
      type: 'washed',
      message: `"${labelName}" marked as washed and stored in History`,
      timestamp: now,
    };

    if (activeBatch) {
      const otherItemsInWash = wardrobe.filter(w => 
        activeBatch.itemIds.includes(w.id) && w.id !== itemId && w.inWash === true
      );
      const isLastItem = otherItemsInWash.length === 0;

      // Update existing batch
      if (firebaseUser) {
        try {
          if (isLastItem) {
            await updateDoc(doc(db, 'batches', activeBatch.id), { status: 'collected', collectedAt: now });
          }
          await updateDoc(doc(db, 'wardrobe', itemId), { inWash: false, isMissing: false });
          await setDoc(doc(db, 'activityLogs', newLog.id), newLog);
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `batches/${activeBatch.id}`);
        }
      } else {
        if (isLastItem) {
          setBatches((prev) =>
            prev.map((b) => (b.id === activeBatch.id ? { ...b, status: 'collected', collectedAt: now } : b))
          );
        }
        setWardrobe((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, inWash: false, isMissing: false } : i))
        );
        setActivityLogs((prev) => [newLog, ...prev]);
      }
    } else {
      // Create a completed history batch record for this item so it appears in History tab!
      const batchId = `batch-${Date.now()}`;

      const newCompletedBatch: LaundryBatch = {
        id: batchId,
        userId: uid,
        roomNumber: roomNum,
        itemIds: [itemId],
        itemCount: 1,
        status: 'collected',
        submittedAt: item?.addedAt || now,
        expectedCollectionDate: now,
        collectedAt: now,
        notes: 'Washed & Collected',
      };

      if (firebaseUser) {
        try {
          await setDoc(doc(db, 'batches', batchId), newCompletedBatch);
          await updateDoc(doc(db, 'wardrobe', itemId), { inWash: false, isMissing: false });
          await setDoc(doc(db, 'activityLogs', newLog.id), newLog);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `batches/${batchId}`);
        }
      } else {
        setBatches((prev) => [newCompletedBatch, ...prev]);
        setWardrobe((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, inWash: false, isMissing: false } : i))
        );
        setActivityLogs((prev) => [newLog, ...prev]);
      }
    }
  };

  const markClothMissing = async (itemId: string) => {
    const uid = firebaseUser?.uid || 'guest';
    const roomNum = user?.roomNumber || '207';
    const item = wardrobe.find((i) => i.id === itemId);
    const labelName = item?.label || 'Garment';

    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      userId: uid,
      roomNumber: roomNum,
      batchId: null,
      type: 'missing',
      message: `"${labelName}" flagged as missing`,
      timestamp: new Date().toISOString(),
    };

    if (firebaseUser) {
      try {
        await updateDoc(doc(db, 'wardrobe', itemId), { isMissing: true });
        await setDoc(doc(db, 'activityLogs', newLog.id), newLog);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `wardrobe/${itemId}`);
      }
    } else {
      setWardrobe((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, isMissing: true } : i))
      );
      setActivityLogs((prev) => [newLog, ...prev]);
    }
  };

  const deleteBatch = async (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;

    if (firebaseUser) {
      try {
        await deleteDoc(doc(db, 'batches', batchId));
        if (batch.status !== 'collected') {
          for (const itemId of batch.itemIds) {
            await updateDoc(doc(db, 'wardrobe', itemId), { inWash: false });
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `batches/${batchId}`);
      }
    } else {
      setBatches((prev) => prev.filter((b) => b.id !== batchId));
      if (batch.status !== 'collected') {
        setWardrobe((prev) =>
          prev.map((i) => (batch.itemIds.includes(i.id) ? { ...i, inWash: false } : i))
        );
      }
    }
  };

  const clearAllBatches = async () => {
    if (firebaseUser) {
      try {
        for (const b of batches) {
          await deleteDoc(doc(db, 'batches', b.id));
          if (b.status !== 'collected') {
            for (const itemId of b.itemIds) {
              await updateDoc(doc(db, 'wardrobe', itemId), { inWash: false });
            }
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `batches/bulk-delete`);
      }
    } else {
      setBatches([]);
      setWardrobe((prev) => prev.map((i) => ({ ...i, inWash: false })));
    }
  };

  const resetDemoData = () => {
    setWardrobe([]);
    setBatches([]);
    setActivityLogs([]);
  };

  const getReadyBatchesCount = () => {
    return batches.filter((b) => b.status === 'ready' || b.status === 'submitted').length;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        firebaseUser,
        authLoading,
        isOnboarded,
        setIsOnboarded,
        wardrobe,
        batches,
        activityLogs,
        categories: DEFAULT_CATEGORIES,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        signOutUser: handleSignOutUser,
        updateUser,
        completeOnboarding,
        addWardrobeItem,
        deleteWardrobeItem,
        updateWardrobeItem,
        submitLaundryBatch,
        markBatchCollected,
        markClothWashed,
        markClothMissing,
        deleteBatch,
        clearAllBatches,
        resetDemoData,
        getReadyBatchesCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
