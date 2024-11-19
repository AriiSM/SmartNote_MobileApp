import React, { useContext, useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import {
  IonContent,
  IonLabel,
  IonText,
  IonHeader,
  IonList,
  IonInfiniteScroll,
  IonPage,
  IonToolbar,
  IonIcon,
  IonButton,
  IonCol,
  IonRow,
  IonGrid,
  IonSearchbar,
  IonInfiniteScrollContent,
  IonSelect,
  IonSelectOption,
  createAnimation,
  IonImg,
} from '@ionic/react';
import { search, wifi, ban, exitOutline, filter } from 'ionicons/icons';
import Navbar from './Navbar';
import Note from './Note';
import { NoteContext } from './NoteProvider';
import { useNetwork } from './capacitor/useNetwork';
import { AuthContext } from './auth/AuthProvider';
import '../theme/NoteList.css';
import ModalMap from './map/ModalMap'; // Import ModalMap

const NoteList: React.FC = () => {
  const { notes, fetchingError, unsaved, setPageNumber, setSearchTerm, setFilterOption } = useContext(NoteContext);
  const { logout } = useContext(AuthContext);
  const { networkStatus } = useNetwork();

  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("all"); 
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAnimatingSearch, setIsAnimatingSearch] = useState(false);
  const [isAnimatingFilter, setIsAnimatingFilter] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);  // State for map modal visibility

  const searchbarRef = useRef<HTMLIonSearchbarElement | null>(null);
  const selectRef = useRef<HTMLIonSelectElement | null>(null);

  // Animation and search handling
  useEffect(() => {
    if (isAnimatingSearch) {
      const searchAnimation = createAnimation()
        .addElement(searchbarRef.current)
        .duration(500)
        .fromTo('width', '0px', '500px')
        .easing('ease-in-out');

      searchAnimation.play();
    }
  }, [isAnimatingSearch]);

  const handleSearchToggle = () => {
    setIsOpenSearch(true);
    setIsAnimatingSearch(true);
  };

  const handleSearchChange = (e: CustomEvent) => {
    setSearchValue(e.detail.value);
  };

  const handleSearchClear = () => {
    setSearchValue("");
    setPageNumber(1);
    setSearchTerm("");
    setIsOpenSearch(false);
  };

  const handleSearchSubmit = () => {
    setPageNumber(1);
    setSearchTerm(searchValue);
  };

  useEffect(() => {
    if (isAnimatingFilter) {
      const filterAnimation = createAnimation()
        .addElement(selectRef.current!)
        .duration(500)
        .fromTo('width', '0px', '500px')
        .easing('ease-in-out');
      
      filterAnimation.play();
    }
  }, [isAnimatingFilter]);

  const handleFilterToggle = () => {
    setIsFilterOpen(true);
    setIsAnimatingFilter(true);
  };

  const applyFilter = () => {
    setFilterOption(filterValue);
    setPageNumber(1);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <Navbar />
          <IonButton fill="clear" onClick={logout} slot="end" className="logout-button">
            <IonIcon icon={exitOutline} slot="icon-only" style={{ fontSize: '3em' }} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid fixed={true} className="full-width-grid">
          <IonRow>
            <IonCol className="left-align">
              {networkStatus.connected ? (
                <IonIcon icon={wifi} style={{ fontSize: '2em' }} />
              ) : (
                <>
                  <IonIcon icon={ban} style={{ fontSize: '2em' }} />
                  Unsaved: {unsaved}
                </>
              )}
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              {isOpenSearch ? (
                <>
                  <IonSearchbar
                    ref={searchbarRef}
                    className="search-bar"
                    placeholder="Search"
                    onIonInput={handleSearchChange}
                    value={searchValue}
                    showCancelButton="focus"
                    onIonCancel={handleSearchClear}
                  />
                  <IonButton onClick={handleSearchSubmit} fill="solid" style={{ marginLeft: '8px' }} >
                    Search
                  </IonButton>
                </>
              ) : (
                <IonButton onClick={handleSearchToggle} className="search-button">
                  <IonIcon icon={search} />
                </IonButton>
              )}
            </IonCol>
            <IonCol>
              {isFilterOpen ? (
                <>
                  <IonSelect
                    ref={selectRef}
                    value={filterValue}
                    className="filter-bar"
                    placeholder="Filter"
                    onIonChange={(e) => setFilterValue(e.detail.value)}
                    style={{ width: '200px', transition: 'all 0.5s ease' }}
                  >
                    <IonSelectOption value="all">All</IonSelectOption>
                    <IonSelectOption value="highPriority">High Priority</IonSelectOption>
                    <IonSelectOption value="completed">Completed</IonSelectOption>
                  </IonSelect>
                  <IonButton onClick={applyFilter} fill="solid" style={{ marginLeft: '8px' }} >
                    Apply Filter
                  </IonButton>
                </>
              ) : (
                <IonButton onClick={handleFilterToggle} fill="solid">
                  <IonIcon icon={filter} />
                </IonButton>
              )}
            </IonCol>
            <IonCol>
              <IonButton onClick={() => setIsMapModalOpen(true)} fill="solid">
                <FaMapMarkerAlt />
              </IonButton>
            </IonCol>
          </IonRow>

          {/* Notes List */}
          <IonRow>
            <IonCol>
              {notes && (
                <IonList className="note-list">
                  {notes.map(note => (
                    <Note key={note.id} {...note}>
                      <IonLabel>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h2 className="note-title">{note.titlu}</h2>
                            <IonText color="medium">
                              <p className="note-priority">Prioritate: {note.prioritate}</p>
                            </IonText>
                          </div>
                          {note.coords && (
                            <FaMapMarkerAlt style={{ height: 30, width: 30, marginLeft: '280px' }} />
                          )}
                          {note.photo && (
                            <IonImg src={note.photo.webviewPath} style={{ height: 100, width: 100 }} />
                          )}
                        </div>
                      </IonLabel>
                    </Note>
                  ))}
                </IonList>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonInfiniteScroll onIonInfinite={(e) => { e.target.complete(); setPageNumber((prev) => prev + 1); }}>
          <IonInfiniteScrollContent loadingText="Please wait..." loadingSpinner="bubbles"></IonInfiniteScrollContent>
        </IonInfiniteScroll>

        {fetchingError && <div>{fetchingError.message || 'Failed to fetch items'}</div>}

        {/* Map Modal Integration */}
        <ModalMap
          isOpen={isMapModalOpen}
          setIsOpen={setIsMapModalOpen}
          notebook={{ notes }}
        />
      </IonContent>
    </IonPage>
  );
};

export default NoteList;
