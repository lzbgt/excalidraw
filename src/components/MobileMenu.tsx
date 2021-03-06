import React from "react";
import { AppState } from "../types";
import { ActionManager } from "../actions/manager";
import { t, setLanguage } from "../i18n";
import Stack from "./Stack";
import { LanguageList } from "./LanguageList";
import { showSelectedShapeActions } from "../element";
import { NonDeletedExcalidrawElement } from "../element/types";
import { FixedSideContainer } from "./FixedSideContainer";
import { Island } from "./Island";
import { HintViewer } from "./HintViewer";
import { calculateScrollCenter } from "../scene";
import { SelectedShapeActions, ShapesSwitcher } from "./Actions";
import { Section } from "./Section";
import { RoomDialog } from "./RoomDialog";
import { SCROLLBAR_WIDTH, SCROLLBAR_MARGIN } from "../scene/scrollbars";
import { LockIcon } from "./LockIcon";
import { LoadingMessage } from "./LoadingMessage";
import { UserList } from "./UserList";

type MobileMenuProps = {
  appState: AppState;
  actionManager: ActionManager;
  exportButton: React.ReactNode;
  setAppState: any;
  elements: readonly NonDeletedExcalidrawElement[];
  libraryMenu: JSX.Element | null;
  onRoomCreate: () => void;
  onUsernameChange: (username: string) => void;
  onRoomDestroy: () => void;
  onLockToggle: () => void;
  canvas: HTMLCanvasElement | null;
};

export const MobileMenu = ({
  appState,
  elements,
  libraryMenu,
  actionManager,
  exportButton,
  setAppState,
  onRoomCreate,
  onUsernameChange,
  onRoomDestroy,
  onLockToggle,
  canvas,
}: MobileMenuProps) => (
  <>
    {appState.isLoading && <LoadingMessage />}
    <FixedSideContainer side="top">
      <Section heading="shapes">
        {(heading) => (
          <Stack.Col gap={4} align="center">
            <Stack.Row gap={1}>
              <Island padding={1}>
                {heading}
                <Stack.Row gap={1}>
                  <ShapesSwitcher
                    elementType={appState.elementType}
                    setAppState={setAppState}
                    isLibraryOpen={appState.isLibraryOpen}
                  />
                </Stack.Row>
              </Island>
              <LockIcon
                checked={appState.elementLocked}
                onChange={onLockToggle}
                title={t("toolBar.lock")}
              />
            </Stack.Row>
            {libraryMenu}
          </Stack.Col>
        )}
      </Section>
      <HintViewer appState={appState} elements={elements} />
    </FixedSideContainer>
    <div
      className="App-bottom-bar"
      style={{
        marginBottom: SCROLLBAR_WIDTH + SCROLLBAR_MARGIN * 2,
        marginLeft: SCROLLBAR_WIDTH + SCROLLBAR_MARGIN * 2,
        marginRight: SCROLLBAR_WIDTH + SCROLLBAR_MARGIN * 2,
      }}
    >
      <Island padding={3}>
        {appState.openMenu === "canvas" ? (
          <Section className="App-mobile-menu" heading="canvasActions">
            <div className="panelColumn">
              <Stack.Col gap={4}>
                {actionManager.renderAction("loadScene")}
                {actionManager.renderAction("saveScene")}
                {actionManager.renderAction("saveAsScene")}
                {exportButton}
                {actionManager.renderAction("clearCanvas")}
                <RoomDialog
                  isCollaborating={appState.isCollaborating}
                  collaboratorCount={appState.collaborators.size}
                  username={appState.username}
                  onUsernameChange={onUsernameChange}
                  onRoomCreate={onRoomCreate}
                  onRoomDestroy={onRoomDestroy}
                />
                {actionManager.renderAction("changeViewBackgroundColor")}
                <fieldset>
                  <legend>{t("labels.language")}</legend>
                  <LanguageList
                    onChange={async (lng) => {
                      await setLanguage(lng);
                      setAppState({});
                    }}
                  />
                </fieldset>
                <fieldset>
                  <legend>{t("labels.collaborators")}</legend>
                  <UserList mobile>
                    {Array.from(appState.collaborators)
                      // Collaborator is either not initialized or is actually the current user.
                      .filter(([_, client]) => Object.keys(client).length !== 0)
                      .map(([clientId, client]) => (
                        <React.Fragment key={clientId}>
                          {actionManager.renderAction(
                            "goToCollaborator",
                            clientId,
                          )}
                        </React.Fragment>
                      ))}
                  </UserList>
                </fieldset>
              </Stack.Col>
            </div>
          </Section>
        ) : appState.openMenu === "shape" &&
          showSelectedShapeActions(appState, elements) ? (
          <Section className="App-mobile-menu" heading="selectedShapeActions">
            <SelectedShapeActions
              appState={appState}
              elements={elements}
              renderAction={actionManager.renderAction}
              elementType={appState.elementType}
            />
          </Section>
        ) : null}
        <footer className="App-toolbar">
          <div className="App-toolbar-content">
            {actionManager.renderAction("toggleCanvasMenu")}
            {actionManager.renderAction("toggleEditMenu")}
            {actionManager.renderAction("undo")}
            {actionManager.renderAction("redo")}
            {actionManager.renderAction(
              appState.multiElement ? "finalize" : "duplicateSelection",
            )}
            {actionManager.renderAction("deleteSelectedElements")}
          </div>
          {appState.scrolledOutside && (
            <button
              className="scroll-back-to-content"
              onClick={() => {
                setAppState({
                  ...calculateScrollCenter(elements, appState, canvas),
                });
              }}
            >
              {t("buttons.scrollBackToContent")}
            </button>
          )}
        </footer>
      </Island>
    </div>
  </>
);
