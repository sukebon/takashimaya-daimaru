"use client";
import { Box, Flex } from "@mantine/core";
import { PropsWithChildren, useEffect } from "react";
import NabBar from "../components/nav/nav-bar";
import { CurrentUser, useStore } from "@/store";
import { auth, db } from "@/firebase/client";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { type Project } from "@/types";

export default function DashboardLayout({ children }: PropsWithChildren) {
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const setProjects = useStore((state) => state.setProjects);

  onAuthStateChanged(auth, async (session) => {
    if (session) {
      const docRef = doc(db, "users", session.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists) return;
      setCurrentUser({ ...docSnap.data(), id: docSnap.id } as CurrentUser);
    } else {
      setCurrentUser(null);
    }
  });

  useEffect(() => {
    const getProjects = async () => {
      const docsRef = collection(db, "projects");
      const q = query(
        docsRef,
        where("deletedAt", "==", null),
        where("isCompleted", "==", false),
        orderBy("createdAt", "desc")
      );
      onSnapshot(q, (snapshot) => {
        setProjects(
          snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Project))
        );
      });
    };
    getProjects();
  }, [setProjects]);

  return (
    <Flex w="100%" mih="100vh" direction="column" bg="#f4f4f4">
      <NabBar />
      <Box w="100%" maw={1300} mx="auto" mih={"calc(100vh - 50px)"} p="lg">
        {children}
      </Box>
    </Flex>
  );
}
