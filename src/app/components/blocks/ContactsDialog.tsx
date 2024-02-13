import { FC, useCallback } from "react";
import classNames from "clsx";
import { Field, Form } from "react-final-form";
import { ethers } from "ethers";

import * as Repo from "core/repo";
import { TEvent, trackEvent } from "core/client";

import {
  composeValidators,
  focusOnErrors,
  maxLength,
  minLength,
  required,
  validateAddress,
  withHumanDelay,
} from "app/utils";
import { useContactsDialog } from "app/hooks/contacts";
import { useDialog } from "app/hooks/dialog";
import { useToast } from "app/hooks/toast";
import SecondaryModal from "app/components/elements/SecondaryModal";
import Input from "app/components/elements/Input";
import AddressField from "app/components/elements/AddressField";
import Button from "app/components/elements/Button";
import { ReactComponent as AvatarPlaceholderIcon } from "app/icons/avatar-placeholder.svg";
import WalletAvatar from "../elements/WalletAvatar";

type FormValues = {
  name: string;
  address: string;
};

const ContactsDialog: FC = () => {
  const { alert } = useDialog();
  const { updateToast } = useToast();
  const { modalData, upsertContact } = useContactsDialog();

  const handleSubmit = useCallback(
    async ({ name: newName, address: newAddress }: FormValues) =>
      withHumanDelay(async () => {
        if (modalData) {
          newAddress = ethers.getAddress(newAddress);
          const { name, address, addedAt, fromPage } = modalData;
          const isNew = !name || !address;
          try {
            const isChangedAddress = newAddress !== address;
            if (isNew || isChangedAddress) {
              await Repo.contacts.add({
                name: newName,
                address: newAddress,
                addedAt: isNew || !addedAt ? new Date().getTime() : addedAt,
              });
              if (isNew) {
                trackEvent(TEvent.Contact, { fromPage: fromPage || false });
              }
              if (isChangedAddress && address) {
                await Repo.contacts.delete(address);
              }
              updateToast(`Contact "${newName}" successfully created!`);
            } else {
              await Repo.contacts.put({
                name: newName,
                address: newAddress,
                addedAt: addedAt!,
              });
              updateToast(`Contact "${name}" successfully updated!`);
            }

            upsertContact(null);
          } catch (err: any) {
            alert({ title: "Error!", content: err.message });
          }
        }
      }),
    [modalData, upsertContact, updateToast, alert],
  );

  if (modalData === null) {
    return null;
  }

  const { name, address, ...rest } = modalData;
  const isNew = !name || !address;

  return (
    <SecondaryModal
      open={true}
      onOpenChange={() => upsertContact(null)}
      header={isNew ? "Add new contact" : "Edit contact"}
      className="max-w-[43.75rem]"
      headerClassName="!text-[2rem] !mb-6"
      {...rest}
    >
      <Form<FormValues>
        onSubmit={handleSubmit}
        decorators={[focusOnErrors]}
        initialValues={{
          name: name,
          address: address,
        }}
        render={({ form, handleSubmit, submitting, values }) => (
          <div className="flex justify-center w-full">
            <div
              className={classNames(
                "h-[7.75rem] w-[7.75rem] min-w-[7.75rem]",
                "mr-16",
                "bg-black/20",
                "rounded-[.625rem]",
                "overflow-hidden",
              )}
            >
              {address || values.address ? (
                <WalletAvatar
                  seed={values.address ?? address}
                  className="w-full h-full"
                />
              ) : (
                <AvatarPlaceholderIcon className="w-full h-full" />
              )}
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-start w-full max-w-[22rem]"
            >
              <Field
                name="name"
                validate={composeValidators(
                  required,
                  minLength(3),
                  maxLength(40),
                )}
              >
                {({ input, meta }) => (
                  <Input
                    label="Name"
                    placeholder="Type contact's name"
                    error={meta.error && meta.touched}
                    errorMessage={meta.error}
                    className="w-full mb-3"
                    {...input}
                  />
                )}
              </Field>
              <Field
                name="address"
                validate={composeValidators(required, validateAddress)}
              >
                {({ input, meta }) => (
                  <AddressField
                    label="Address"
                    placeholder="Type contact's address"
                    setFromClipboard={(value) => form.change("address", value)}
                    error={meta.error && meta.touched}
                    errorMessage={meta.error}
                    className="w-full"
                    {...input}
                  />
                )}
              </Field>
              <Button
                type="submit"
                className="mt-5 w-full"
                loading={submitting}
              >
                {isNew ? "Add" : "Save"}
              </Button>
            </form>
          </div>
        )}
      />
    </SecondaryModal>
  );
};

export default ContactsDialog;
