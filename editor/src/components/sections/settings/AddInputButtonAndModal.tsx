import React, { useCallback, useRef, useState } from "react";

import { injectUploadCommentIntoCode } from "/@/utils/codeComments";

import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Radio,
  RadioGroup,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useHashParamBase64 } from "@metapages/hash-query/react-hooks";
import { Plus, UploadSimple } from "@phosphor-icons/react";

export const AddInputButtonAndModal: React.FC<{
  add: (name: string, url: string) => void;
  text?: string;
}> = ({ add, text }) => {
  const { isOpen, onClose, onToggle } = useDisclosure();
  const toast = useToast();
  const [code, setCode] = useHashParamBase64("js");

  const [mode, setMode] = useState<"url" | "file">("url");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setMode("url");
    setName("");
    setUrl("");
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
  }, []);

  const closeAndClear = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name) return;

      if (mode === "url") {
        if (!url) return;
        add(name, url);
        closeAndClear();
        return;
      }

      // File upload mode
      if (!selectedFile) return;

      setIsUploading(true);
      setUploadProgress(10);

      try {
        // Compute SHA256 hash of file content
        const fileBuffer = await selectedFile.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", fileBuffer);
        const sha256 = Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        setUploadProgress(20);

        const presignRes = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: selectedFile.name,
            contentType: selectedFile.type || "application/octet-stream",
            fileSize: selectedFile.size,
            sha256,
          }),
        });

        if (!presignRes.ok) {
          const err = await presignRes
            .json()
            .catch(() => ({ error: presignRes.statusText }));
          throw new Error(err.error || `Presign failed: ${presignRes.status}`);
        }

        setUploadProgress(40);
        const { presignedUrl, canonicalPath } = await presignRes.json();

        const uploadRes = await fetch(presignedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": selectedFile.type || "application/octet-stream",
          },
          body: selectedFile,
        });

        if (!uploadRes.ok) {
          throw new Error(`Upload failed: ${uploadRes.status}`);
        }

        setUploadProgress(100);
        const canonicalUrl = `${window.location.origin}${canonicalPath}`;
        add(name, canonicalUrl);

        // Inject code comments so the user/LLM knows how to access the file
        const contentType = selectedFile.type || "application/octet-stream";
        const newCode = injectUploadCommentIntoCode(
          [{ name, url: canonicalUrl, contentType }],
          code,
        );
        setCode(newCode);

        toast({
          title: `Uploaded ${selectedFile.name}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        closeAndClear();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        toast({
          title: "Upload failed",
          description: message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [name, url, mode, selectedFile, add, closeAndClear, toast, code, setCode],
  );

  const canSubmit =
    name && (mode === "url" ? url : selectedFile) && !isUploading;

  return (
    <>
      <Button
        variant="ghost"
        leftIcon={<Icon as={Plus} boxSize={6} />}
        onClick={onToggle}
        aria-label="add input"
      >
        {text || "Add Input"}
      </Button>

      <Modal isOpen={isOpen} onClose={closeAndClear}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text>Add Initial Input:</Text>
          </ModalHeader>
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel htmlFor="name">Input Name</FormLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., data, config"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Source</FormLabel>
                  <RadioGroup
                    value={mode}
                    onChange={(v) => setMode(v as "url" | "file")}
                  >
                    <HStack spacing={4}>
                      <Radio value="url">URL</Radio>
                      <Radio value="file">File Upload</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>

                {mode === "url" ? (
                  <FormControl>
                    <FormLabel htmlFor="url">URL</FormLabel>
                    <Input
                      id="url"
                      type="text"
                      placeholder="https://example.com/data.json"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </FormControl>
                ) : (
                  <FormControl>
                    <FormLabel>File</FormLabel>
                    <input
                      ref={fileInputRef}
                      type="file"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                        if (file && !name) {
                          setName(file.name);
                        }
                      }}
                    />
                    <HStack>
                      <Button
                        size="sm"
                        leftIcon={<Icon as={UploadSimple} />}
                        onClick={() => fileInputRef.current?.click()}
                        isDisabled={isUploading}
                      >
                        Choose File
                      </Button>
                      <Text fontSize="sm" color="gray.600" noOfLines={1}>
                        {selectedFile ? selectedFile.name : "No file selected"}
                      </Text>
                    </HStack>
                    {isUploading && (
                      <Progress
                        mt={2}
                        value={uploadProgress}
                        size="sm"
                        colorScheme="blue"
                        borderRadius="md"
                        hasStripe
                        isAnimated
                      />
                    )}
                  </FormControl>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                type="submit"
                colorScheme="blackAlpha"
                mr={3}
                isDisabled={!canSubmit}
                isLoading={isUploading}
                loadingText="Uploading"
              >
                Add
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
