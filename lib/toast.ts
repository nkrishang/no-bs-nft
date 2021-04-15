export const errorToast = (toast: any, message: string) => {
  toast({
    title: message,
    status: "error",
    variant: "subtle",
    duration: 10000,
    isClosable: true,
  });
}

export const successToast = (toast: any, message: string) => {
  toast({
    title: message,
    status: "success",
    variant: "subtle",
    duration: 10000,
    isClosable: true,
  });
}

export const infoToast = (toast: any, message: string) => {
  toast({
    title: message,
    status: "info",
    variant: "subtle",
    duration: 10000,
    isClosable: true,
  });
}